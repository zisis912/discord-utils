const { Client, SnowflakeUtil, TextChannel } = require("discord.js-selfbot-v13")
const { once } = require("events")

async function multiAccountFetchFromNDaysAgo(channel, days, tokenArray = [], filterFn, mapFn) {
    // login to all accounts
    const accountArray = []
    for (const token of tokenArray) {
        const client = new Client({})
        await client.login(token)
        await once(client, "ready")
        console.log(`${client.user.username} is ready!`)
        console.log(client.token)
        accountArray.push(client)
    }

    console.log("All clients have been logged into, starting the fetches")

    const promiseArray = []

    const currentTimeTimestamp = new Date().getTime()
    const NDaysAgoTimestamp = currentTimeTimestamp - days * 24 * 60 * 60 * 1000
    const timestampIncrements = splitRangeIntoParts(currentTimeTimestamp, NDaysAgoTimestamp, accountArray.length + 1)
    console.log(timestampIncrements)

    for (let i = 0; i < timestampIncrements.length - 1; i++) {
        const beforeId = SnowflakeUtil.generate(timestampIncrements[i])
        const afterId = SnowflakeUtil.generate(timestampIncrements[i + 1])
        const client = accountArray[i]
        promiseArray.push(
            unlimitedFetchBetweenSnowflakes(channel, beforeId, afterId, `thread ${i + 1}`, client, filterFn, mapFn)
        )
    }

    const resolvedMessageArray = await Promise.all(promiseArray)

    console.log("timestamp at time of search: " + currentTimeTimestamp)
    return resolvedMessageArray.flat(1)
}
exports.multiAccountFetchFromNDaysAgo = multiAccountFetchFromNDaysAgo

async function unlimitedFetchBetweenSnowflakes(
    channel,
    beforeSnowflake,
    afterSnowflake,
    threadName,
    client,
    filterFn,
    mapFn
) {
    channel = resolveChannel(channel, client)

    let messages = []
    let messagePointer = beforeSnowflake

    while (messagePointer) {
        console.log((threadName ? `[${threadName}] ` : "") + "current message pointer: " + messagePointer) // logging

        // let messagePage = await channel.messages.fetch({ limit: 100, before: messagePointer });
        const messagePage = await fetchBeforeAndAfter(channel, messagePointer, afterSnowflake)

        messages = [...messages, ...messagePage.filter(filterFn).map(mapFn)]

        messagePointer = messagePage.at(-1)?.id
    }
    console.log(messages.length)
    return messages
}

async function fetchBeforeAndAfter(channel, before, after) {
    const messages = []
    const result = await channel.messages.fetch({ limit: 100, before })
    // console.log(result);
    for (const msg of result.values()) {
        if (msg.id <= after) return messages
        messages.push(msg)
    }
    return messages
}
function splitRangeIntoParts(start, end, parts) {
    const result = [start]
    parts--

    for (let i = parts; i > 0; i--) {
        const lastValue = result.at(-1)
        result.push(lastValue + Math.ceil((end - lastValue) / i))
    }

    return result
}
function resolveChannel(input, client) {
    if (input instanceof TextChannel) return input
    if (typeof input === "string") return client.channels.cache.get(input)
    throw new Error("Invalid Channel: " + input)
}
