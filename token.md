# Generate an access token

Generate access tokens to access the Connect APIs.

This endpoint implements the OAuth 2.0 `token` endpoint, as part of the Authorization Code flow with Proof Key for Code Exchange (PKCE). For more information, see [Authentication](https://www.canva.dev/docs/connect/authentication/).

To generate an access token, you must provide one of the following:

* An authorization code
* A refresh token

Generating a token using either an authorization code or a refresh token allows your integration to act on behalf of a user. You must first [obtain user authorization and get an authorization code](https://www.canva.dev/docs/connect/authentication/#obtain-user-authorization).

Access tokens may be up to 4 KB in size, and are only valid for a specified period of time. The expiry time (currently 4 hours) is shown in the endpoint response and is subject to change.

**Endpoint authentication**

Requests to this endpoint require authentication with your client ID and client secret, using *one* of the following methods:

* **Basic access authentication** (Recommended): For [basic access authentication](https://en.wikipedia.org/wiki/Basic_access_authentication), the `{credentials}` string must be a Base64 encoded value of `{client id}:{client secret}`.
* **Body parameters**: Provide your integration's credentials using the `client_id` and `client_secret` body parameters.

This endpoint can't be called from a user's web-browser client because it uses client authentication with client secrets. Requests must come from your integration's backend, otherwise they'll be blocked by Canva's [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) policy.

**Generate an access token using an authorization code**

To generate an access token with an authorization code, you must:

* Set `grant_type` to `authorization_code`.
* Provide the `code_verifier` value that you generated when creating the user authorization URL.
* Provide the authorization code you received after the user authorized the integration.

**Generate an access token using a refresh token**

Using the `refresh_token` value from a previous user token request, you can get a new access token with the same or smaller scope as the previous one, but with a refreshed expiry time. You will also receive a new refresh token that you can use to refresh the access token again.

To refresh an existing access token, you must:

* Set `grant_type` to `refresh_token`.
* Provide the `refresh_token` from a previous token request.

## HTTP method and URL path

POST https\://api.canva.com/rest/v1/oauth/token

## Authentication and authorization

This endpoint uses HTTP basic access authentication.

## Header parameters

<Prop.List>
  <Prop name="Authorization" type="string">
    Provides credentials to authenticate the request, in the form of [basic access authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).

    For example: `Authorization: Basic {credentials}`

    NOTE: We recommend that you use basic access authentication instead of specifying `client_id` and `client_secret` as body parameters.
  </Prop>

  <Prop name="Content-Type" type="string" required>
    Indicates the media type of the information sent in the request. This must be set to `application/x-www-form-urlencoded`.

    For example: `Content-Type: application/x-www-form-urlencoded`
  </Prop>
</Prop.List>

## Body parameters

<Tabs>
  <Tab name="authorization_code">
    For exchanging an authorization code for an access token.

    <Prop.List>
      <Prop name="grant_type" type="string" required>
        For exchanging an authorization code for an access token.

        <Prop.Extras>
          **Available values:** The only valid value is `authorization_code`.
        </Prop.Extras>
      </Prop>

      <Prop name="code_verifier" type="string" required>
        The `code_verifier` value that you generated when creating the user authorization URL.
      </Prop>

      <Prop name="code" type="string" required>
        The authorization code you received after the user authorized the integration.
      </Prop>

      <Prop name="client_id" type="string">
        Your integration's unique ID, for authenticating the request.

        NOTE: We recommend that you use basic access authentication instead of specifying `client_id` and `client_secret` as body parameters.
      </Prop>

      <Prop name="client_secret" type="string">
        Your integration's client secret, for authenticating the request. Begins with `cnvca`.

        NOTE: We recommend that you use basic access authentication instead of specifying `client_id` and `client_secret` as body parameters.
      </Prop>

      <Prop name="redirect_uri" type="string">
        Only required if a redirect URL was supplied when you [created the user authorization URL](https://www.canva.dev/docs/connect/authentication/#create-the-authorization-url).

        Must be one of those already specified by the client. If not supplied, the first redirect\_uri defined for the client will be used by default.
      </Prop>
    </Prop.List>
  </Tab>

  <Tab name="refresh_token">
    For generating an access token using a refresh token.

    <Prop.List>
      <Prop name="grant_type" type="string" required>
        For generating an access token using a refresh token.

        <Prop.Extras>
          **Available values:** The only valid value is `refresh_token`.
        </Prop.Extras>
      </Prop>

      <Prop name="refresh_token" type="string" required>
        The refresh token to be exchanged. You can copy this value from the successful response received when generating an access token.
      </Prop>

      <Prop name="client_id" type="string">
        Your integration's unique ID, for authenticating the request.

        NOTE: We recommend that you use basic access authentication instead of specifying `client_id` and `client_secret` as body parameters.
      </Prop>

      <Prop name="client_secret" type="string">
        Your integration's client secret, for authenticating the request. Begins with `cnvca`.

        NOTE: We recommend that you use basic access authentication instead of specifying `client_id` and `client_secret` as body parameters.
      </Prop>

      <Prop name="scope" type="string">
        Optional scope value when refreshing an access token. Separate multiple [scopes](https://www.canva.dev/docs/connect/appendix/scopes/) with a single space between each scope.

        The requested scope cannot include any permissions not already granted, so this parameter allows you to limit the scope when refreshing a token. If omitted, the scope for the token remains unchanged.
      </Prop>
    </Prop.List>
  </Tab>
</Tabs>

## Example request

Examples for using the `/v1/oauth/token` endpoint:

<Tabs storageKey="example.language" disableContentTransition>
  <Tab name="cURL">
    ```sh
    curl --request POST 'https://api.canva.com/rest/v1/oauth/token' \
    --header 'Authorization: Basic {credentials}' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'grant_type=authorization_code' \
    --data-urlencode 'code_verifier=i541qdcfkb4htnork0w92lnu43en99ls5a48ittv6udqgiflqon8vusojojakbq4' \
    --data-urlencode 'code=kp8nnroja7qnx00.opyc1p76rcbyflsxbycjqfp3ub8vzsvltpzwafy9q5l45dn5fxzhe7i7a6mg1i2t8jpsa6sebdeumkzzhicskabgevrxsssec4dvjwfvhq4gs3ugghguar0voiqpfb7axsapiojoter8v3w2s5s3st84jpv2l06h667iw241xngy9c8=vu1tnjp7sz' \
    --data-urlencode 'redirect_uri=https://example.com/process-auth'
    ```
  </Tab>

  <Tab name="Node.js">
    ```js
    const fetch = require("node-fetch");
    const { URLSearchParams } = require("url");

    fetch("https://api.canva.com/rest/v1/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": "Basic {credentials}",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams("grant_type=authorization_code&code_verifier=i541qdcfkb4htnork0w92lnu43en99ls5a48ittv6udqgiflqon8vusojojakbq4&code=kp8nnroja7qnx00.opyc1p76rcbyflsxbycjqfp3ub8vzsvltpzwafy9q5l45dn5fxzhe7i7a6mg1i2t8jpsa6sebdeumkzzhicskabgevrxsssec4dvjwfvhq4gs3ugghguar0voiqpfb7axsapiojoter8v3w2s5s3st84jpv2l06h667iw241xngy9c8%3Dvu1tnjp7sz&redirect_uri=https%3A%2F%2Fexample.com%2Fprocess-auth"),
    })
      .then(async (response) => {
        const data = await response.json();
        console.log(data);
      })
      .catch(err => console.error(err));
    ```
  </Tab>

  <Tab name="Java">
    ```java
    import java.io.IOException;
    import java.net.URI;
    import java.net.http.*;

    public class ApiExample {
        public static void main(String[] args) throws IOException, InterruptedException {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.canva.com/rest/v1/oauth/token"))
                .header("Authorization", "Basic {credentials}")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .method("POST", HttpRequest.BodyPublishers.ofString("grant_type=authorization_code&code_verifier=i541qdcfkb4htnork0w92lnu43en99ls5a48ittv6udqgiflqon8vusojojakbq4&code=kp8nnroja7qnx00.opyc1p76rcbyflsxbycjqfp3ub8vzsvltpzwafy9q5l45dn5fxzhe7i7a6mg1i2t8jpsa6sebdeumkzzhicskabgevrxsssec4dvjwfvhq4gs3ugghguar0voiqpfb7axsapiojoter8v3w2s5s3st84jpv2l06h667iw241xngy9c8%3Dvu1tnjp7sz&redirect_uri=https%3A%2F%2Fexample.com%2Fprocess-auth"))
                .build();

            HttpResponse<String> response = HttpClient.newHttpClient().send(
                request,
                HttpResponse.BodyHandlers.ofString()
            );
            System.out.println(response.body());
        }
    }
    ```
  </Tab>

  <Tab name="Python">
    ```py
    import requests

    headers = {
        "Authorization": "Basic {credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "grant_type": "authorization_code",
        "code_verifier": "i541qdcfkb4htnork0w92lnu43en99ls5a48ittv6udqgiflqon8vusojojakbq4"
        "code": "kp8nnroja7qnx00.opyc1p76rcbyflsxbycjqfp3ub8vzsvltpzwafy9q5l45dn5fxzhe7i7a6mg1i2t8jpsa6sebdeumkzzhicskabgevrxsssec4dvjwfvhq4gs3ugghguar0voiqpfb7axsapiojoter8v3w2s5s3st84jpv2l06h667iw241xngy9c8=vu1tnjp7sz",
        "redirect_uri": "https://example.com/process-auth",
    }

    response = requests.post("https://api.canva.com/rest/v1/oauth/token",
        headers=headers,
        data=data
    )
    print(response.json())
    ```
  </Tab>

  <Tab name="C#">
    ```csharp
    using System.Net.Http;

    var client = new HttpClient();
    var request = new HttpRequestMessage
    {
      Method = HttpMethod.Post,
      RequestUri = new Uri("https://api.canva.com/rest/v1/oauth/token"),
      Headers =
      {
        { "Authorization", "Basic {credentials}" },
      },
      Content = new StringContent(
        "grant_type=authorization_code&code_verifier=i541qdcfkb4htnork0w92lnu43en99ls5a48ittv6udqgiflqon8vusojojakbq4&code=kp8nnroja7qnx00.opyc1p76rcbyflsxbycjqfp3ub8vzsvltpzwafy9q5l45dn5fxzhe7i7a6mg1i2t8jpsa6sebdeumkzzhicskabgevrxsssec4dvjwfvhq4gs3ugghguar0voiqpfb7axsapiojoter8v3w2s5s3st84jpv2l06h667iw241xngy9c8%3Dvu1tnjp7sz&redirect_uri=https%3A%2F%2Fexample.com%2Fprocess-auth",
        Encoding.UTF8,
        "application/x-www-form-urlencoded"
      ),
    };

    using (var response = await client.SendAsync(request))
    {
      response.EnsureSuccessStatusCode();
      var body = await response.Content.ReadAsStringAsync();
      Console.WriteLine(body);
    };
    ```
  </Tab>

  <Tab name="Go">
    ```go
    package main

    import (
    	"fmt"
    	"io"
    	"net/http"
    	"strings"
    )

    func main() {
    	payload := strings.NewReader("grant_type=authorization_code&code_verifier=i541qdcfkb4htnork0w92lnu43en99ls5a48ittv6udqgiflqon8vusojojakbq4&code=kp8nnroja7qnx00.opyc1p76rcbyflsxbycjqfp3ub8vzsvltpzwafy9q5l45dn5fxzhe7i7a6mg1i2t8jpsa6sebdeumkzzhicskabgevrxsssec4dvjwfvhq4gs3ugghguar0voiqpfb7axsapiojoter8v3w2s5s3st84jpv2l06h667iw241xngy9c8%3Dvu1tnjp7sz&redirect_uri=https%3A%2F%2Fexample.com%2Fprocess-auth")

    	url := "https://api.canva.com/rest/v1/oauth/token"
    	req, _ := http.NewRequest("POST", url, payload)
    	req.Header.Add("Authorization", "Basic {credentials}")
    	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

    	res, _ := http.DefaultClient.Do(req)
    	defer res.Body.Close()
    	body, _ := io.ReadAll(res.Body)
    	fmt.Println(string(body))
    }
    ```
  </Tab>

  <Tab name="PHP">
    ```php
    $curl = curl_init();
    curl_setopt_array($curl, array(
      CURLOPT_URL => "https://api.canva.com/rest/v1/oauth/token",
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HTTPHEADER => array(
        'Authorization: Basic {credentials}',
        'Content-Type: application/x-www-form-urlencoded',
      ),
      CURLOPT_POSTFIELDS => "grant_type=authorization_code&code_verifier=i541qdcfkb4htnork0w92lnu43en99ls5a48ittv6udqgiflqon8vusojojakbq4&code=kp8nnroja7qnx00.opyc1p76rcbyflsxbycjqfp3ub8vzsvltpzwafy9q5l45dn5fxzhe7i7a6mg1i2t8jpsa6sebdeumkzzhicskabgevrxsssec4dvjwfvhq4gs3ugghguar0voiqpfb7axsapiojoter8v3w2s5s3st84jpv2l06h667iw241xngy9c8%3Dvu1tnjp7sz&redirect_uri=https%3A%2F%2Fexample.com%2Fprocess-auth"
    ));

    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);

    if (empty($err)) {
      echo $response;
    } else {
      echo "Error: " . $err;
    }
    ```
  </Tab>

  <Tab name="Ruby">
    ```ruby
    require 'net/http'
    require 'uri'

    url = URI('https://api.canva.com/rest/v1/oauth/token')
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(url)
    request['Authorization'] = 'Basic {credentials}'
    request['Content-Type'] = 'application/x-www-form-urlencoded'
    request.body = "grant_type=authorization_code&code_verifier=i541qdcfkb4htnork0w92lnu43en99ls5a48ittv6udqgiflqon8vusojojakbq4&code=kp8nnroja7qnx00.opyc1p76rcbyflsxbycjqfp3ub8vzsvltpzwafy9q5l45dn5fxzhe7i7a6mg1i2t8jpsa6sebdeumkzzhicskabgevrxsssec4dvjwfvhq4gs3ugghguar0voiqpfb7axsapiojoter8v3w2s5s3st84jpv2l06h667iw241xngy9c8%3Dvu1tnjp7sz&redirect_uri=https%3A%2F%2Fexample.com%2Fprocess-auth"

    response = http.request(request)
    puts response.read_body
    ```
  </Tab>
</Tabs>

## Success response

If successful, the endpoint returns a `200` response with a JSON body with the following parameters:

<Prop.List>
  <Prop name="access_token" type="string" required mode="output">
    The bearer access token to use to authenticate to Canva Connect API endpoints. If requested using a `authorization_code` or `refresh_token`, this allows you to act on behalf of a user.
  </Prop>

  <Prop name="refresh_token" type="string" required mode="output">
    The token that you can use to refresh the access token.
  </Prop>

  <Prop name="token_type" type="string" required mode="output">
    The token type returned. This is always `Bearer`.
  </Prop>

  <Prop name="expires_in" type="integer" required mode="output">
    The expiry time (in seconds) for the access token.
  </Prop>

  <Prop name="scope" type="string" mode="output">
    The [scopes](https://www.canva.dev/docs/connect/appendix/scopes/) that the token has been granted.
  </Prop>
</Prop.List>

## Example response

```json
{
  "access_token": "JagALLazU0i2ld9WW4zTO4kaG0lkvP8Y5sSO206ZwxNF4E1y3xKJKF7TzN17BXTfaNOeY0P88AeRCE6cRF7SJzvf3Sx97rA80sGHtFplFo",
  "refresh_token": "JABix5nolsk9k8n2r0f8nq1gw4zjo40ht6sb4i573wgdzmkwdmiy6muh897hp0bxyab276wtgqkvtob2mg9aidt5d6rcltcbcgs101",
  "token_type": "Bearer",
  "expires_in": 14400,
  "scope": "asset:read design:meta:read design:permission:read folder:read"
}
```
