import PocketBase from "pocketbase"

const client = new PocketBase(process.env.POCKETBASE_URL)
const redirectUrl = `${
  process.env.OAUTH_REDIRECT_URL || location.origin
}/redirect.html`
console.log({ redirectUrl })

// parse the query parameters from the redirected url
const params = new URL(window.location).searchParams

// load the previously stored provider's data
const provider = JSON.parse(localStorage.getItem("provider"))

// compare the redirect's state param and the stored provider's one
if (provider.state !== params.get("state")) {
  throw "State parameters don't match."
}

// authenticate
client.users
  .authViaOAuth2(
    provider.name,
    params.get("code"),
    provider.codeVerifier,
    redirectUrl
  )
  .then((authData) => {
    console.log(JSON.stringify(authData, null, 2))
    console.log("Successfully authenticated!")
    location.href = "/index.html"
  })
  .catch((err) => {
    document.getElementById("content").innerText =
      "Failed to exchange code.\n" + err
  })
