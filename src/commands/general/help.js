const { readdir, readdirSync } = require("fs");
const { sep } = require("path");
const { MessageEmbed } = require("discord.js");

module.exports.run = async(client, message, args) => {
    const { prefix, color, emoji, footer } = client.config;
    const { channel, author } = message;

    let dir = `${process.cwd()}${sep}src${sep}commands`
    let categories;
    readdir(dir, (err, files) => {
        categories = files; // Makes the categories variable equal to the files variable so we can use it in the whole file
    });
    setTimeout(() => { // There is a 1ms timeout here because node goes through the rest of the code before reading the directory for some reason, this just "prevents" that from happening
        if(!args.length) { // If there aren't any categories provided, show a menu with all the categories
            const help = new MessageEmbed()
                .setColor(color.positive)
                .setAuthor(author.tag, author.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }))
                .setTitle(`${emoji.positive} Help`)
                .setFooter(footer);
            
            categories.forEach(category => { // for each category in the categories variable, add an embed field for that category
                help.addField(category.toLocaleUpperCase(), `\`${prefix}help ${category}\``, true)
            });
            channel.send(help);
            return;
        }
        else {
            if(!categories.includes(args[0])) { // if the user provided an invalid category, send an error message
                channel.send(
                    new MessageEmbed()
                    .setColor(color.positive)
                    .setAuthor(author.tag, author.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }))
                    .setTitle(`${emoji.negative} Error!`)
                    .addField("Invalid Argument", "You must specify a valid category!")
                    .setFooter(footer)
                );
                return;
            };
            if(categories.includes(args[0])) { // If the provided category is valid
                dir = `${dir}${sep}${args[0]}`;
                
                const help = new MessageEmbed()
                    .setColor(color.positive)
                    .setAuthor(author.tag, author.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }))
                    .setTitle(`${emoji.positive} Help - ${args[0].toLocaleUpperCase()}`)
                    .setFooter(footer);

                const commands = readdirSync(dir).filter(f => f.endsWith(".js")); // ignore non-js files
                commands.forEach(command => {
                    const cmd = require(`${dir}${sep}${command}`); // require the command file
                    help.addField(cmd.help.name, `*${cmd.help.description}*\n**Aliases:** ${cmd.help.aliases ? undefined : "None"}\n**Owner Only:** ${cmd.help.ownerOnly}`);
                });
                channel.send(help);
            };
        };
    }, 1);
};

module.exports.help = {
    name: "help",
    description: "Shows you a list of commands and information about them.",
    usage: "[category]",
    minArgs: 1,
    maxArgs: 3
};