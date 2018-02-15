# Monzo Balance

Love Monzo? Sometimes want to check your balance without out any other functionality whatsoever?? Monzo Balance is for you...

![Screenshot](https://raw.githubusercontent.com/stuart-williams/monzo-balance/master/assets/screenshot.png)

## Features

View your balance!

## Installation

* Go setup a Monzo client in the [developer console](https://developers.monzo.com/)
* `git clone git@github.com:stuart-williams/monzo-balance.git`
* `npm install`
* Create the `.env` file in the project root
* `npm start`

Your `.env` file must contain the following values

```
CLIENT_ID=[your client id]
CLIENT_SECRET=[your client secret]
REDIRECT_URI=http://localhost:8080/auth-redirect
SESSION_SECRET=1234
STATE_SECRET=1234
COOKIE_DOMAIN=localhost
```
