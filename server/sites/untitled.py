#import discord
#from discord.ext import commands
#bot = commands.Bot(command_prefix = "!", description = "Bot test")

import os
import random
import asyncio

import discord
from discord.ext import commands
from discord.ext.commands.converter import UserConverter

from dotenv import load_dotenv

load_dotenv() 
TOKEN = os.getenv('DISCORD_TOKEN')
SERVER = os.getenv('DISCORD_SERVER')

intents = discord.Intents.default()
intents.members = True
#client = discord.Client(intents = intents)
bot = commands.Bot(command_prefix = '!', intents = intents)

@bot.event
async def on_ready():
    print(f'{bot.user.name} has connected to Discord!')

@bot.event
async def on_member_join(member):
    role = discord.utils.get(member.guild.roles, name = "Client")
    await member.add_roles(role)

@bot.command(name = 'recette', help = 'Répond avec une recette au hasard.')
async def recipe(ctx):
    if ctx.author == bot.user:
        return
    recipes = ['Lasagnes ?', 'Pizza ?', 'Gâteau ?']
    response = random.choice(recipes)
    await ctx.send(response)
    
@bot.command(name = 'de', help = 'Simule un lancer de dé.')
async def roll(ctx, nombre_de_de: int, nombre_de_cote: int):
    dice = [str(random.choice(range(1, nombre_de_cote + 1)))
            for _ in range(nombre_de_de)]
    await ctx.send(', '.join(dice))
    
@bot.command(name = 'create-channel', brief = 'Créer un nouveau channel textuel.', help = 'Créer un nouveau channel textuel. Par défaut dans la catégorie : SALONS TEXTUELS.')
@commands.has_role('Admin')
async def create_channel(ctx, channel_name, category_name = 'SALONS TEXTUELS'):
    server = ctx.guild
    existing_channel = discord.utils.get(server.channels, name = channel_name)
    category = discord.utils.get(ctx.guild.categories, name = category_name)
    
    if not category:
        await ctx.send(f'{ctx.author.mention}, cette catégorie n\'existe pas. Place le channel dans une catégorie existante.')
        return
    if not existing_channel:
        print(f'Creating a new channel: {channel_name}')
        await server.create_text_channel(channel_name, category = category)

@bot.command(name = 'hello', help = 'Message de bienvenue et de présentation du bot.')
async def hello(ctx):
    await ctx.send('Bienvenue chez **R&L**, le restaurant où toutes les saveurs se rejoignent.\nJe suis un **serveur virtuel** du restaurant. Vous pouvez commander votre repas avec moi en tapant ce que vous désirez. Vous pouvez également me demander d\'afficher le menu avec la commande ***!menu*** ou plus spécifiquement les entrées, plats, desserts et même les vins avec les commandes respectives (***!entrees***, ***!plats***, ***!desserts***, ***!vins***).\nJe peux aussi vous conseiller pour le choix d\'un verre de vin ou d\'un dessert si vous le souhaitez.')

@bot.command(name = 'menu', help = 'Affiche le menu du restaurant')
async def menu(ctx):
    #, file = discord.File('menu_complet.jpg')
    await ctx.send('Voici le menu complet :')
    message = await ctx.send('Si vous souhaitez accéder aux différentes cartes, veuillez cliquer sur l\'émoji concerné :\n\t🥗 : Entrées\n\t🍔 : Plats\n\t🍪 : Desserts\n\t🍷 : Vins')
    await message.add_reaction('🥗')
    await message.add_reaction('🍔')
    await message.add_reaction('🍪')
    await message.add_reaction('🍷')
    
    def checkUser(reaction, user):
        return ctx.message.author == user and message.id == reaction.message.id
    
    loop = 0
    while loop == 0:
        try:
            reaction, user = await bot.wait_for("reaction_add", timeout = 60, check = checkUser)
            if reaction.emoji == '🥗':
                await entrees.invoke(ctx)
                await message.remove_reaction('🥗', user)
            elif reaction.emoji == '🍔':
                await plats.invoke(ctx)
                await message.remove_reaction('🍔', user)
            elif reaction.emoji == '🍪':
                await desserts.invoke(ctx)
                await message.remove_reaction('🍪', user)
            elif reaction.emoji == '🍷':
                await vins.invoke(ctx)
                await message.remove_reaction('🍷', user)
        except asyncio.TimeoutError:
            await ctx.send('Vous ne pouvez plus réagir avec les émojis.\nRetapez la commande ***!menu*** ou l\'une des commandes ***!entrees***, ***!plats***, ***!desserts*** ou ***!vins*** si vous souhaitez accéder de nouveaux aux menus.')
            loop = 1
    

@bot.command(name = 'entrees', help = 'Affiche les entrées à la carte')
async def entrees(ctx):
    await ctx.send('Voici la carte des entrées :')

@bot.command(name = 'plats', help = 'Affiche les plats à la carte')
async def plats(ctx):
    await ctx.send('Voici la carte des plats :')
    
@bot.command(name = 'desserts', help = 'Affiche les desserts à la carte')
async def desserts(ctx):
    await ctx.send('Voici la carte des desserts :')
    
@bot.command(name = 'vins', help = 'Affiche les vins à la carte')
async def vins(ctx):
    await ctx.send('Voici la carte des vins :')

@bot.command(name = 'bienvenue', help = 'Message d\'accueil')
async def bienvenue(ctx):
    accueil_channel_id = 823971750156304434
    if ctx.channel.id != accueil_channel_id:
        return
    message = await ctx.send('Bonjour et bienvenue chez **R&L**, le restaurant où toutes les saveurs se rejoignent.\n\
Je suis un serveur virtuel du restaurant et je vais vous accompagner tout au long de votre repas chez nous !\n\
Veuillez cliquer sur le **numéro** de votre table s\'il vous plaît. Celui-ci est inscrit directement sur la table. Vous allez être redirigé vers le salon propre à votre table. À tout de suite 🧑‍🍳')
    await message.add_reaction('1️⃣')
    await message.add_reaction('2️⃣')
    await message.add_reaction('3️⃣')
    await message.add_reaction('4️⃣')
    await message.add_reaction('5️⃣')
    
    def checkUser(reaction, user):
        #print(ctx.guild.members)
        return user in ctx.guild.members and message.id == reaction.message.id and message.author != bot.user
    
    loop = 0
    while loop == 0:
        try:
            reaction, user = await bot.wait_for("reaction_add", check = checkUser)
            print('oui')
            if reaction.emoji == '1️⃣':
                role = discord.utils.get(ctx.guild.roles, name = "Table 1")
                await user.add_roles(role)
                await message.remove_reaction('1️⃣', user)
            elif reaction.emoji == '2️⃣':
                role = discord.utils.get(ctx.guild.roles, name = "Table 2")
                await user.add_roles(role)
                await message.remove_reaction('2️⃣', user)
            elif reaction.emoji == '3️⃣':
                role = discord.utils.get(ctx.guild.roles, name = "Table 3")
                await user.add_roles(role)
                await message.remove_reaction('3️⃣', user)
            elif reaction.emoji == '4️⃣':
                role = discord.utils.get(ctx.guild.roles, name = "Table 4")
                await user.add_roles(role)
                await message.remove_reaction('4️⃣', user)
            elif reaction.emoji == '5️⃣':
                role = discord.utils.get(ctx.guild.roles, name = "Table 5")
                await user.add_roles(role)
                await message.remove_reaction('5️⃣', user)
        except asyncio.TimeoutError:
            await ctx.send('Vous ne pouvez plus réagir avec les émojis.\nRetapez la commande ***!bienvenue***.')
            loop = 1
    

@bot.command(name = 'delete', help = 'Supprime les messages pour nettoyer la table.')
@commands.has_any_role('Admin', 'Serveur')
async def delete(ctx, number: int = 100):
    messages = await ctx.channel.history(limit = number).flatten()
    await ctx.channel.delete_messages(messages)


    


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.errors.CheckFailure):
        await ctx.send(f'{ctx.author.mention}, tu n\'as pas la permission de faire ça. Contacte un Admin si besoin.')


bot.run(TOKEN)