# Work bot

## Features

### Start

This will set start of working time.

```
/workbot start
```

Returns following message:
- Started working time: tuesday, **6.5.2017** at **7:45**. Time to get work done, we need to make some money.

### Status

This will show remaining working time.

```
/workbot status
```

Returns following message:
- Remaining working time: **1:45**. Oh, the time flies so fast.

### End

This will set end of working time.

```
/workbot end
```

Returns following message:
- Ended working time: tuesday, **6.5.2017** at **15:47**. Total time: **8:02**. Well, tomorrow is another day. Good job!

---

## Automation

Command `/workbot status` could be called automatically when aproaching to end time.

## API

Run localtunnel:

```
lt --port 8765 --subdomain workbot
```

Url:

https://workbot.localtunnel.me

// Deprecated idea: Using service api.ai -> Perhaps another day.

## Login teams

```
https://workbot.localtunnel.me/login
```

### Start

```
CLIENT_ID=xxx.yyy CLIENT_SECRET=zzz VERIFICATION_TOKEN=qqq PORT=8765 npm start
```

## Help

[Botkit - Open-source toolkit for creating bots](https://howdy.ai/botkit/)