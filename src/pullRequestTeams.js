const PULL_REQUEST_TEAMS = {
  requiredReviewers: {
    teamSlug: 'pr-required-reviewers',
    displayName: 'required reviewers'
  },
  assuranceDomainReviewers: {
    teamSlug: 'pr-assurance-domain-reviewers',
    displayName: 'assurance domain reviewers'
  },
  assuranceDomainLead: {
    teamSlug: 'pr-assurance-domain-lead',
    displayName: 'assurance domain lead'
  },
  ifsDomainReviewers: {
    teamSlug: 'pr-ifs-domain-reviewers',
    displayName: 'internal firm services domain reviewers'
  },
  ifsDomainLead: {
    teamSlug: 'pr-ifs-domain-lead',
    displayName: 'internal firm services domain lead'
  },
  taxDomainReviewers: {
    teamSlug: 'pr-tax-domain-reviewers',
    displayName: 'tax domain reviewers'
  },
  taxDomainLead: {
    teamSlug: 'pr-tax-domain-lead',
    displayName: 'tax domain lead'
  },
  rpaReviewers: {
    teamSlug: 'pr-rpa-reviewers',
    displayName: 'robotic process automation reviewers'
  }
};

export default Object.freeze(PULL_REQUEST_TEAMS);
