# World Cup 2026 Bracket Web App
[Live Application](https://wc26-bracket.pages.dev/) · [Backend Repository](https://github.com/kuwarantine/wc26-server)
## Overview
A friend of mine was running a Euro 2024 prediction competition using Excel sheets. Manually tracking predictions was error-prone (and a waste of time), so I built a web app to automate the process. This is the World Cup 2026 version, featuring significant improvements to the original app.
## Screenshots
<img width="38%" height="auto" alt="Knockout" src="https://github.com/user-attachments/assets/4e2504d6-68f8-4899-a922-884327f785c5" /><img width="28%" height="auto" alt="Standings" src="https://github.com/user-attachments/assets/2641a385-416c-4bcd-bf93-89773ad80b00" /><img width="28%" height="auto" alt="Groups" src="https://github.com/user-attachments/assets/753f1995-d06f-46ee-95c3-05cdf8327f88" />

## Key Features
- Interactive tournament brackets and group standings
- Live match scores and updates
- Automated prediction scoring and user rankings
- Daily match predictions from users

## Frontend
The frontend was built using React and Chakra UI v3. Chakra provides a lot of components and elements out of the box, and allows for inline styling (which I find useful being a developer over a designer). It's also easy to develop responsive UI using Chakra's mobile-first breakpoint approach. The toughest parts of the frontend were managing the real-time updates and creating the knockout bracket. 

### Real-time Updates
The real-time updates required managing live game context throughout the app, and providing suitable fallbacks when a game wasn't live. After establishing a connection to the backend, game updates would be sent through server-sent events. To prevent spamming the backend and having to keep connections alive, the server closes a connection if matches aren't live, and the frontend schedules the reconnection. More on those details and a Heroku quirk in the backend repo.

### Knockout Bracket
The knockout bracket was a surprisingly difficult problem and there were no readily available solutions. In the Euro version, I manually placed cards and drew lines from DOM coordinates. It wasn't a very efficient solution, but I was under time pressure, and it worked! This time around, I took a look at existing implementations on sports websites.
The solution I ended up with was calculating the spacing between match cards and connecting lines based on the currently selected round. Then, as you swiped between rounds, the container height and spacing between cards would automatically adjust. I also paid a lot of attention to how components would be positioned off-screen and animated to give a smooth experience (which I think I pulled off!).

## Tech Stack
| Component | Technology |
| --------- | ---------- |
| Frontend | TypeScript, React, Chakra UI |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Hosting | Cloudflare, Heroku |
