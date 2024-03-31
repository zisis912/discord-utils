# discord-utils
Allows for fetching messages from Disocrd API with multiple accounts, for faster speeds.

# HOW TO USE
1) Download the file (obviously)
2) Install dependency: `npm i discord.js-selfbot-v13`
3) You can now import the file into your project, and use its exported functions

# Documentation
## multiAccountFetchFromNDaysAgo(channel, days, tokenArray: string[], filterFn, mapFn) :
`channel`: channel ID to fetch messages from. Can be a `TextChannel` or a `string`

`days`: How many days ago to start fetching messages from. There is no option to stop, it will scan all the messages from N days ago up until now.

`tokenArray`: Array of the tokens of all your discord accounts, in string form.

`filterFn()`: filter function, takes a discord.js Message Object as input and returns true or false. The multiAccountFetch function will only return messages that pass this test.  
—————————  
Example function: `(msg) => msg.content === '' && /^\w+ (?:joined|left) the server(?: for the first time)?$/.test(msg.embeds[0].author.name)`  
This function filters messages that have no normal content, and their embed is referring to someone joining/leaving the server.

`mapFn()`: map function, takes a discord.js Message Object as input and returns anything you want. Every message that has passed the filter will be ran through this function.  
——————————   
Example function: `(piece) => ({ embedContent: piece.embeds[0].author.name, timestamp: piece.createdTimestamp })`  
This function maps every message to an object, keeping only the useful parts of it. (in this case, the embed Content, and the timestamp of the message)

### Return Value: an array of whatever the output of mapFn is.
