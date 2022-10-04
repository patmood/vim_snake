import { Score } from "./types"
import formatDistanceToNow from "date-fns/formatDistanceToNow"

function UTCtoDate(utcString) {
  const [year, month, day, hour, minute, second] = utcString
    .split(/[-:\s\.]/)
    .slice(0, 6)
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second))
}

export function renderLeaderboard({ scores }: { scores: Array<Score> }) {
  const rows = scores
    .map((score, i) => {
      return `
    <tr>
      <td>${i + 1}</td>
      <td>${score.score}</td>
      <td>
        <a class="leaders-namewrapper" href="https://${
          score.authProvider
        }.com/${score.displayName}" target="_blank">
          <img class="leaders-avatar" src="${score.avatarUrl}" />
          <div>
            @${score.displayName}
          </div>
        </a>
      </td>
      <td>
        <p title="${UTCtoDate(score.timestamp)}">
          ${formatDistanceToNow(UTCtoDate(score.timestamp), {
            addSuffix: true,
          })}
        </p>
      </td>
      <td>
        <div class="leaders-gamethumb">
          <img src="${score.gameImage}" />
        </div>
      </td>
    </tr>
    `
    })
    .join("")

  return `
<table class="leaders">
  <thead>
    <th>Rank</th>
    <th>Score</th>
    <th>Who</th>
    <th>When</th>
    <th>How</th>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
`
}
