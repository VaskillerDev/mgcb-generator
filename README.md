<h1>mgcb-generator</h1>
Simple .mgcb file generator for Monogame. CLI-tools for generate .mgcb from args or config file.
The file is also generated based on the attributes.

<h2>Installation</h2>

```sh
npm install mgcb-generator -g
```

<h2>Usage</h2>

```
where is one of:
init, gen

mgcbg help         quick help
mgcbg init         init mgcb-gen-config.json file for generate .mgcb file content
mgcbg gen          genearte .mgcb file content
```

<h2>Why?</h2>
It's simple. 
I needed a simple tool that easily automates the 
creation of mgcb files without dragging and 
dropping content in the mgcb-editor gui.<br>
In the future, the tool will add the necessary file formats and 
automates the content Assembly using the mgcb-editor itself.

<h2>How does it work?</h2>
For example your have: <br>

```sh
foo@bar:~$ ls root/your/awesome/MonogameProject
bin
Game1.cs
obj
Program.cs
```

Now we need to go to our project folder and generate a configuration file for the generator:

```sh
foo@bar:~$ cd root/your/awesome/MonogameProject

# Here you need to add the directories with your files.
# For example, goblin/goblin.png and goblin/goblin.json
foo@bar:/root/your/awesome/MonogameProject/$ mkdir content

foo@bar:/root/your/awesome/MonogameProject/$ mgcbg init
foo@bar:/root/your/awesome/MonogameProject/$ ls
bin
Game1.cs
obj
Program.cs
mgcb-gen-config.json # added new file
```

Now check the file to see if the necessary configurations are set there.
The tool will try to find the paths to the required packages by itself.
If it doesn't find it, please set it yourself.<br/>
Initially, the configuration file should look something like this:<br>

```json
{
  "content": "./content",
  "debug": false,
  "asepriteLib": "/path/to/your/MonoGame.Aseprite.dll",
  "asepritePipeline": "path/to/your/MonoGame.Aseprite.ContentPipeline.dll",
  "editor": "/path/to/your/mgcb-editor.exe"
}
```

Now we generate our final content.mgcb

```sh
# Generate our content.mgcb
foo@bar:/root/your/awesome/MonogameProject/$ mgcbg gen
foo@bar:/root/your/awesome/MonogameProject/$ cd content
foo@bar:/root/your/awesome/MonogameProject/content/$ ls
goblin
content.mgcb
```

Now we can build a resource using mgcb-editor.
