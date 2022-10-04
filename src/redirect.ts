import PocketBase from "pocketbase"

const client = new PocketBase()
const redirectUrl = `${location.origin}/redirect.html`
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
async function authenticate() {
  try {
    const authData = await client.users.authViaOAuth2(
      provider.name,
      params.get("code"),
      provider.codeVerifier,
      redirectUrl
    )

    console.log(JSON.stringify(authData, null, 2))
    const { profile } = client.authStore.model
    if (profile) {
      const data = {
        name: authData.meta.username,
        avatarUrl: authData.meta.avatarUrl,
        authProvider: provider.name,
      }
      const updateResult = await client.records.update(
        "profiles",
        profile.id,
        data
      )
    }
    console.log("Successfully authenticated!")
    location.href = "/"
  } catch (error) {
    document.getElementById("content").innerText =
      "Failed to exchange code.\n" + error
  }
}
authenticate()
