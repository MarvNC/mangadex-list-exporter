### [Install](https://raw.githubusercontent.com/MarvNC/mangadex-list-exporter/master/mangadex-list-exporter.user.js)
# mangadex-list-exporter
 A userscript for exporting a MangaDex list to a .xml file for import to anime list sites.
 
 ## Usage
 Navigate to your MDList, which can be accessed via the top right menu. Set the list view style to 'simple list' and press the button at the top that reads 'export list.' After exporting the list, you can view the export progress by navigating to the browser developer console. The export function will take some time, as this script waits for 1 second in between requesting information from MangaDex.

 ![simple list](https://i.fiery.me/s5rzu.png)
 
# Exported file
 The generated .xml file is of the MyAnimeList export format, containing elements for use with various manga tracking sites. These include:
- `manga_mangadb_id`: MyAnimeList ID
- `manga_mangadex_id`: MangaDex ID
- `manga_anilist_id`: AniList ID
- `manga_kitsu_id`: Kitsu ID
- `manga_mangaupdates_id`: MangaUpdates ID
- `manga_animeplanet_slug`: Anime-Planet slug
