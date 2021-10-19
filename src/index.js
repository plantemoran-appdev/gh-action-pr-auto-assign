import * as core from '@actions/core';
import * as github from '@actions/github';
import pullRequestTeams from './pullRequestTeams';
import repoTopics from './repositoryTopics';

async function run() {
  var x = 0;
  try {
    // ensure we're in a pull request
    ensurePullRequest();

    // setup vars
    const githubToken = core.getInput('githubToken');
    const pat = core.getInput('additionalAccessPat');
    const octokitGithub = github.getOctokit(githubToken);
    const octokitPat = github.getOctokit(pat);
    const org = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const prNumber = github.context.issue.number;
    const prAuthorLogin = github.context.payload.pull_request.user.login;

    // get the topics for the repo
    const topics = await getTopicsForRepo(octokitGithub, org, repo);

    // always request reviews from the required reviewers
    const reviewerTeam = pullRequestTeams.requiredReviewers;
    await addPullRequestReviewers(octokitPat, octokitGithub, org, repo, prNumber, reviewerTeam, prAuthorLogin);

    // assurance reviews and assignments
    if (topics.includes(repoTopics.assurance)) {
      const reviewerTeam = pullRequestTeams.assuranceDomainReviewers;
      const assigneeTeam = pullRequestTeams.assuranceDomainLead;

      await addPullRequestReviewers(octokitPat, octokitGithub, org, repo, prNumber, reviewerTeam, prAuthorLogin);
      await addPullRequestAssignees(octokitPat, octokitGithub, org, repo, prNumber, assigneeTeam);
    }

    // internal firm services reviews and assignments
    if (topics.includes(repoTopics.internalFirmServices)) {
      const reviewerTeam = pullRequestTeams.ifsDomainReviewers;
      const assigneeTeam = pullRequestTeams.ifsDomainLead;

      await addPullRequestReviewers(octokitPat, octokitGithub, org, repo, prNumber, reviewerTeam, prAuthorLogin);
      await addPullRequestAssignees(octokitPat, octokitGithub, org, repo, prNumber, assigneeTeam);
    }

    // tax reviews and assignments
    if (topics.includes(repoTopics.tax)) {
      const reviewerTeam = pullRequestTeams.taxDomainReviewers;
      const assigneeTeam = pullRequestTeams.taxDomainLead;

      await addPullRequestReviewers(octokitPat, octokitGithub, org, repo, prNumber, reviewerTeam, prAuthorLogin);
      await addPullRequestAssignees(octokitPat, octokitGithub, org, repo, prNumber, assigneeTeam);
    }

    // robotic process automation reviews
    if (topics.includes(repoTopics.roboticProcessAutomation)) {
      const reviewerTeam = pullRequestTeams.rpaReviewers;

      await addPullRequestReviewers(octokitPat, octokitGithub, org, repo, prNumber, reviewerTeam, prAuthorLogin);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

/**
 * adds pull request assignees
 * @param {object} octokitPat - the octokit client to use for making api calls (authenticated with the additional access PAT)
 * @param {object} octokitGh - the octokit client to use for making api calls (authenticated with the GitHub token)
 * @param {string} org - the github organization name
 * @param {string} repo - the repository name
 * @param {int} prNumber - the pull request number
 * @param {object} assigneesTeam - the assignees team information
 * @returns {void}
 */
async function addPullRequestAssignees(octokitPat, octokitGh, org, repo, prNumber, assigneesTeam) {
  core.info(`Assigning this pull request to ${assigneesTeam.displayName}...`);

  const members = await getTeamMemberLogins(octokitPat, org, assigneesTeam.teamSlug);
  const comment = `:zap: Automatically assigning the pull request to ${assigneesTeam.displayName}. :zap:`;

  if (members.length === 0) {
    core.info('There are no members in the team from which to add assignees.');
    return;
  }

  await octokitGh.rest.issues.createComment({ owner: org, repo: repo, issue_number: prNumber, body: comment });
  await octokitGh.rest.issues.addAssignees({ owner: org, repo: repo, issue_number: prNumber, assignees: members });
}

/**
 * adds pull request reviewers
 * @param {object} octokitPat - the octokit client to use for making api calls (authenticated with the additional access PAT)
 * @param {object} octokitGh - the octokit client to use for making api calls (authenticated with the GitHub token)
 * @param {string} org - the github organization name
 * @param {string} repo - the repository name
 * @param {int} prNumber - the pull request number
 * @param {*} reviewersTeam - the reviewers team information
 * @param {string} prAuthorLogin - the PR author's login (to be filtered out)
 * @returns
 */
async function addPullRequestReviewers(octokitPat, octokitGh, org, repo, prNumber, reviewersTeam, prAuthorLogin) {
  core.info(`Requesting reviews from ${reviewersTeam.displayName}...`);

  const members = await getTeamMemberLogins(octokitPat, org, reviewersTeam.teamSlug, prAuthorLogin);
  const comment = `:zap: Automatically requesting reviews from ${reviewersTeam.displayName}. :zap:`;

  if (members.length === 0) {
    core.info('There are no members in the team from which to request reviews.');
    return;
  }

  await octokitGh.rest.issues.createComment({ owner: org, repo: repo, issue_number: prNumber, body: comment });
  await octokitGh.rest.pulls.requestReviewers({ owner: org, repo: repo, pull_number: prNumber, reviewers: members });
}

/**
 * Ensures this action is running in the context of a pull request event.
 */
function ensurePullRequest() {
  core.info('Ensuring we are in the context of a pull request event ...');

  if (github.context.eventName !== 'pull_request') {
    const errorMessage =
      `This action should only be used on pull requests! ` + `The current event is: ${github.context.eventName}`;

    throw errorMessage;
  }
}

/**
 * Gets the logins for all members of a team.
 * @param {object} octokit - the octokit client to use for making api calls
 * @param {string} org - the github organization name
 * @param {string} teamSlug - the slug for the team
 * @param {string} prAuthorLogin - (optional) the PR author's login (to be filtered out)
 * @returns {Array}
 */
async function getTeamMemberLogins(octokit, org, teamSlug, prAuthorLogin) {
  core.info(`Getting the team members for the ${teamSlug} team...`);

  // get all of the team members' logins
  const response = await octokit.rest.teams.listMembersInOrg({ org: org, team_slug: teamSlug });
  let logins = response.data.map((o) => o.login);

  // filter out the pr author's login if it has a value
  if (prAuthorLogin) {
    core.info('Filtering out the pull request author from the team members...');
    logins = logins.filter((o) => o !== prAuthorLogin);
  }

  core.info(`The following logins were found for the team: ${logins}`);

  return logins;
}

/**
 * Gets the topics that are applied to a repository.
 * @param {*} octokit - the octokit client to use for making api calls
 * @param {*} org - the github organization name
 * @param {*} repo - the repository name
 * @returns {Array}
 */
async function getTopicsForRepo(octokit, org, repo) {
  core.info('Getting the topics for the repository...');

  const topicsResponse = await octokit.rest.repos.getAllTopics({ owner: org, repo: repo });
  const topics = topicsResponse.data.names;

  core.info(`The following topics were found on the repository: ${topics}`);

  return topics;
}

run();
