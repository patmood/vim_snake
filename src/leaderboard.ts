import { firebase, db, functions } from './firebase'
import template from 'lodash/template'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { Score } from './types'

const leaderEl = document.getElementById('leaders')
const renderLeaderboard = template(
  `
<table class="leaders">
  <thead>
    <th>Rank</th>
    <th>Score</th>
    <th>Who</th>
    <th>When</th>
    <th>How</th>
  </thead>
  <tbody>
    <% scores.forEach((score, i) => { %>
      <tr>
        <td><%= i + 1 %></td>
        <td><%= score.score %></td>
        <td>
          <a class="leaders-namewrapper" href="https://twitter.com/<%= score.displayName %>" target="_blank">
            <img class="leaders-avatar" src="<%= score.picture %>" />
            <div>
              @<%= score.displayName %>
            </div>
          </a>
        </td>
        <td>
          <p title="<%= new Date(score.timestamp.seconds * 1000) %>">
            <%= formatDistanceToNow(
              new Date(score.timestamp.seconds * 1000),
              { addSuffix: true }) %>
          </p>
        </td>
        <td>
          <div class="leaders-gamethumb">
            <img src="<%= score.gameImage %>" />
          </div>
        </td>
      </tr>
    <% } )%>
  </tbody>
</table>
`,
  { imports: { formatDistanceToNow } }
)

db.collection('scores')
  .orderBy('score', 'desc')
  .limit(10)
  .onSnapshot((querySnapshot: firebase.firestore.QuerySnapshot) => {
    const scores: Score[] = []
    querySnapshot.forEach((doc) => {
      scores.push(doc.data() as Score)
    })
    leaderEl.innerHTML = renderLeaderboard({ scores })
  })
