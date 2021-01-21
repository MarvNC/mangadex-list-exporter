### [Install](https://raw.githubusercontent.com/MarvNC/mangadex-list-exporter/master/mangadex-list-exporter.user.js)
# mangadex-list-exporter
 A userscript for exporting a MangaDex list to a .xml file for import to anime list sites.
 
 ## Usage
 Navigate to your MDList, which can be accessed via the top right menu and press the button at the top that reads 'export list.' The export function will take some time to complete, as this script waits for 1 second in between each request for information from MangaDex.
 
# Exported file
 The generated .xml file is of the MyAnimeList export format, containing extra elements for use with various manga tracking sites. These include:
- `manga_mangadb_id`: MyAnimeList ID
- `manga_mangadex_id`: MangaDex ID
- `manga_anilist_id`: AniList ID
- `manga_kitsu_id`: Kitsu ID
- `manga_mangaupdates_id`: MangaUpdates ID
- `manga_animeplanet_slug`: Anime-Planet slug

Do note that the IDs other than MAL's IDs aren't currently supported by any manga list tracking databases, but maybe they'll be supported by some in the future!
