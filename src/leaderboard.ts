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
    <th>Name</th>
    <th></th>
  </thead>
  <tbody>
    <% scores.forEach((score, i) => { %>
      <tr>
        <td><%= i + 1 %></td>
        <td><%= score.score %></td>
        <td>
          <div class="leaders-namewrapper">
            <div><img src="<%= score.picture %>" /></div>
            <div>@<%= score.displayName %></div>
          </div>
          <div title="<%= new Date(score.timestamp.seconds * 1000) %>"><%= formatDistanceToNow(new Date(score.timestamp.seconds * 1000), { addSuffix: true }) %></div>
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
    console.log({ scores })
    leaderEl.innerHTML = renderLeaderboard({ scores })
  })
