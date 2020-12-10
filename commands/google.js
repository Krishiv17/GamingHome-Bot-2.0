module.exports = {
    name: "google",
    cooldown: 5,
    description: "google your message",
    usage: "[message]",
    execute(message) {
        const Discord = require ('discord.js')
        let MSG = message.content.split(" ").slice(1).join("+");
        let MS = message.content.split(" ").slice(1).join(" ");
        if(!MSG)return message.channel.send("You didn't put anything to google lol! Handy Dandy Tip - Don't spam commands or it may result in a bot ban")
        
        const google = new Discord.MessageEmbed()
        .setColor('#4287f5')
        .setAuthor('Google Search', "https://cdn.arstechnica.net/wp-content/uploads/2018/07/Chrome-Logo-800x652.png")
        .setDescription(`Search: ${MS}`)
        .addField('link', `[Google Search](https://www.google.com/search?q=${MSG})`)
message.channel.send(google)
    }
}