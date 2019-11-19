import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container/index';
import { Loading, Owner, IssueList, NextButton } from './styles';

export default class Repository extends Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string
      })
    }).isRequired
  };

  // eslint-disable-next-line react/state-in-constructor
  state = {
    repository: {},
    issues: [],
    loading: true,
    filtro: [
      {
        name: 'Todas',
        value: 'all'
      },
      {
        name: 'Abertas',
        value: 'open'
      },
      {
        name: 'Fechadas',
        value: 'closed'
      }
    ],
    selectedFilter: 'all',
    page: 1
  };

  async componentDidMount() {
    const { match } = this.props;

    const { selectedFilter, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: selectedFilter,
          per_page: 5
        }
      })
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false
    });
  }

  handleFilterChange = async () => {
    const cbFilter = document.getElementById('cbFilter');

    const { value } = cbFilter.options[cbFilter.selectedIndex];

    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: value,
          per_page: 5,
          page: 1
        }
      })
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      selectedFilter: value,
      page: 1
    });
  };

  handlePageChange = async button => {
    const { page, selectedFilter } = this.state;

    await this.setState({
      page: button === 'back' ? page - 1 : page + 1
    });

    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: selectedFilter,
          per_page: 5,
          page
        }
      })
    ]);

    console.log(page);
    this.setState({
      repository: repository.data,
      issues: issues.data
    });
  };

  render() {
    const { repository, issues, loading, filtro, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
          <select
            name="cbFilter"
            id="cbFilter"
            onChange={this.handleFilterChange}
          >
            {filtro.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.name}
              </option>
            ))}
          </select>
        </Owner>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <NextButton>
          <button
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePageChange('back')}
          >
            Anterior
          </button>
          <button type="button" onClick={() => this.handlePageChange('next')}>
            Próximo
          </button>
        </NextButton>
      </Container>
    );
  }
}
