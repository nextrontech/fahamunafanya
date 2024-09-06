// Replace with your GitHub username and repository name
const repoOwner = 'nextrontech';
const repoName = 'fahamunafanya';

// Replace with your GitHub personal access token
const personalAccessToken = 'YOUR_PERSONAL_ACCESS_TOKEN';

// Pre-defined chairperson name (you can add an authentication system later)
const chairpersonName = 'deogratius_malingula';

// User role check
let isChairperson = false;

document.getElementById('username').addEventListener('input', function (e) {
  const username = e.target.value;

  if (username === chairpersonName) {
    isChairperson = true;
    document.getElementById('chairpersonPanel').style.display = 'block';
    document.getElementById('roleStatus').innerText = 'You are the chairperson. You can create topics and moderate discussions.';
  } else {
    isChairperson = false;
    document.getElementById('chairpersonPanel').style.display = 'none';
    document.getElementById('roleStatus').innerText = '';
  }
});

// Function to submit a new topic (only for chairperson)
document.getElementById('topicForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const topicTitle = document.getElementById('topicTitle').value;
  const topicDescription = document.getElementById('topicDescription').value;

  const issueData = {
    title: `Topic: ${topicTitle}`,
    body: topicDescription,
    labels: ['topic']
  };

  fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${personalAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(issueData)
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById('commentStatus').innerText = 'Topic created successfully!';
      document.getElementById('topicForm').reset();
      fetchDiscussions();
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('commentStatus').innerText = 'Error creating topic.';
    });
});

// Function to submit a comment
document.getElementById('commentForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const commentContent = document.getElementById('commentContent').value;

  const issueData = {
    title: `Comment by ${document.getElementById('username').value}`,
    body: commentContent
  };

  fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${personalAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(issueData)
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById('commentStatus').innerText = 'Comment submitted successfully!';
      document.getElementById('commentForm').reset();
      fetchComments();
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('commentStatus').innerText = 'Error submitting comment.';
    });
});

// Function to fetch topics
function fetchDiscussions() {
  fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues?labels=topic`)
    .then(response => response.json())
    .then(issues => {
      const discussionsList = document.getElementById('discussionsList');
      discussionsList.innerHTML = '';

      issues.forEach(issue => {
        const topicElement = document.createElement('div');
        topicElement.classList.add('topic');
        topicElement.innerHTML = `
          <h3>${issue.title}</h3>
          <p>${issue.body}</p>
        `;
        discussionsList.appendChild(topicElement);
      });
    })
    .catch(error => {
      console.error('Error fetching topics:', error);
    });
}

// Function to fetch comments
function fetchComments() {
  fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues?labels=comment`)
    .then(response => response.json())
    .then(issues => {
      const commentsList = document.getElementById('commentsList');
      commentsList.innerHTML = '';

      issues.forEach(issue => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `
          <h3>${issue.title}</h3>
          <p>${issue.body}</p>
          ${isChairperson ? `<button onclick="deleteComment(${issue.number})">Delete</button>` : ''}
        `;
        commentsList.appendChild(commentElement);
      });
    })
    .catch(error => {
      console.error('Error fetching comments:', error);
    });
}

// Chairperson can delete comments
function deleteComment(issueNumber) {
  fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `token ${personalAccessToken}`
    }
  })
    .then(response => {
      if (response.status === 204) {
        alert('Comment deleted successfully.');
        fetchComments();
      } else {
        alert('Failed to delete comment.');
      }
    })
    .catch(error => {
      console.error('Error deleting comment:', error);
    });
}

// Fetch topics and comments on page load
fetchDiscussions();
fetchComments();
