import re
import requests

# Constants for GitHub API
GITHUB_API = "https://api.github.com"
ORGANIZATION = "qosf"

def get_repos(org):
    """Get the list of repositories for the organization."""
    url = f"{GITHUB_API}/orgs/{org}/repos"
    response = requests.get(url)
    return response.json()  # This will return a list of repositories.

def get_contributors(repo):
    """Get the list of contributors for a repository."""
    url = f"{GITHUB_API}/repos/{ORGANIZATION}/{repo}/contributors"
    response = requests.get(url)
    return response.json()  # This will return a list of contributors.

def generate_contributor_snippet(contributor):
    """Generate the HTML snippet for a single contributor."""
    # You would create the HTML snippet based on the structure in `team.md`
    return "<li>" + contributor + "</li>"

def update_team_md(snippets):
    """Update the team.md file with a new list of contributors."""
    with open("qosf.org/team.md", "r", encoding='utf-8') as file:
        content = file.read()

    # Define the start and end markers and the regex pattern to find the section
    # Current implementation breaks if we have multiple html unnumbered lists
    # Easy to fix if needed
    start_marker = "<ul>"
    end_marker = "</ul>"
    pattern = re.compile(f"({re.escape(start_marker)}).*?({re.escape(end_marker)})", re.DOTALL)
    # Join all contributors snippets into a single string
    contributors_section = "\n\t\t".join(snippets)
    # Replace the section between the markers with the new contributors' section
    new_content = pattern.sub(rf"\1{contributors_section}\2", content)

    # Write the updated content back to the file
    with open("qosf.org/team.md", "w", encoding='utf-8') as file:
        file.write(new_content)

def main():
    repos = get_repos(ORGANIZATION)
    all_contributors = {}

    # Collect and sort contributors from all repos
    for repo in repos:
        for contributor in get_contributors(repo['name']):
            all_contributors[contributor['login']] = contributor
    sorted_contributors = list(dict(sorted(all_contributors.items())).keys())

    # Generate HTML snippets for each contributor
    snippets = [generate_contributor_snippet(contributor) for contributor in sorted_contributors]
    # Update team.md
    update_team_md(snippets)

if __name__ == "__main__":
    main()