const { MessageEmbed } = require("discord.js");

module.exports = async(client, message) => {
    const { owners, prefix, color, emoji, footer } = client.config;   // Destructure the variables inside {} from the client.config variable
    const { guild, channel, author, member, content, mentions } = message;    // ^^ except from the message variable
    
    const args = content.slice(prefix.length).trim().split(/ +/g); // Remove the prefix from the args, remove whitespace surrounding the string, and split it on every space.
    let cmd = args.shift().toLowerCase() // Takes the first element of the args array and converts it to lower case so commands aren't case sensitive, allowing for capitalization mistakeent, message, args.join(" "
    
    let command; // variable with no value

    if(mentions.users.get(client.user.id)) {
        channel.send(
            new MessageEmbed()
            .setColor(color.positive)
            .setAuthor(author.tag, author.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }))
            .setTitle("Hello! :smile:")
            .setDescription(`This is a discord.js template bot made by [aanthr0](https://github.com/aanthr0 "GitHub").\nTo display the bot's commands, type \`${prefix}help\`.`)
            .setFooter(footer)
        );
        return; // don't continue with the rest of the code
    };

    if(!content.startsWith(prefix) || !guild || !cmd) return; // If the message content doesn't start with a prefix OR has no guild OR there is no command, ignore the message.
    if(!member) member = await guild.fetchMember(author); // If the message member (message author as a GuildMember) doesn't exist (isn't in cache), fetch the member (which automatically caches it)

    if(cmd.indexOf("\n")) cmd = cmd.split("\n")[0]; // if there is a new line in the command, split the command on that and select the first value in the list       | these still cause errors if the character
    if(cmd.indexOf("​")) cmd = cmd.split("​")[0]; // if there is a zero-width space in the command, split the command on that and select the first value in the list   | is in the middle of the command - idk why
    
    if(client.commands.has(cmd)) command = client.commands.get(cmd); // If the command exists, put that command inside the command variable (defined ln10 col5)
    else if(client.aliases.has(cmd)) command = client.commands.get(client.aliases.get(cmd)) // If the command doesn't exist, check if it's an alias. If it is, put it inside the command variable.

    const { name, ownerOnly, requiredPerms, minArgs, maxArgs, usage } = command.help

    if(ownerOnly == true && !owners.includes(author.id)) {
        channel.send(
            new MessageEmbed()
            .setColor(color.negative)
            .setAuthor(author.tag, author.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }))
            .setTitle(`${emoji.negative} Error!`)
            .addField("Invalid Permissions", "To run this command, you need to be a bot owner!")
            .setFooter(footer)
        );
        return; // don't continue with the rest of the code
    }
    if(requiredPerms && requiredPerms.length) { // if there are required permissions
        for(perm of command.help.requiredPerms) { // loop through the permissions
            if(!member.hasPermission(perm)) { // If the member doesn't have any of the required permissions, send an error
                channel.send(
                    new MessageEmbed()
                    .setColor(color.negative)
                    .setAuthor(author.tag, author.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }))
                    .setTitle(`${emoji.negative} Error!`)
                    .addField("Invalid permissions", `You need to have the \`${perm}\` permission to run this command!`)
                    .setFooter(footer)
                );
                return; // don't continue with the rest of the code
            };
        };
    };

    let reqArgs;
    if(minArgs === maxArgs) reqArgs = `This command requires ${minArgs} arguments!`; // If the minimum and maximum arguments are equal, say that the command requires x arguments -- no more, no less
    if(minArgs > 0 && maxArgs == -1) reqArgs = `This command requires at least ${minArgs} arguments!` // If the minimum arguments are at least 1 and there are infinite maximum arguments, say that the command requires no less than x arguments
    if(minArgs !== maxArgs) reqArgs = `This command requires ${minArgs}-${maxArgs} arguments!`

    if(args.length < minArgs) {
        channel.send(
            new MessageEmbed()
            .setColor(color.negative)
            .setAuthor(author.tag, author.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }))
            .setTitle(`${emoji.negative} Error!`)
            .addField("Not Enough Arguments!", `${reqArgs}\n*Usage: ${prefix}${name} ${usage}*`)
            .setFooter(footer)
        );
        return; // don't continue with the rest of the code
    }
    if(args.length > maxArgs && maxArgs !== -1) {
        channel.send(
            new MessageEmbed()
            .setColor(color.negative)
            .setAuthor(author.tag, author.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }))
            .setTitle(`${emoji.negative} Error!`)
            .addField("Too Many Arguments!", `${reqArgs}\n*Usage: ${prefix}${name} ${usage}*`)
            .setFooter(footer)
        );
        return; // don't continue with the rest of the code
    };

    if(command) command.run(client, message, args); // If the command exists, run it
};