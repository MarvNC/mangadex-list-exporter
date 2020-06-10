// ==UserScript==
// @name         Mangadex List Exporter
// @namespace    https://github.com/MarvNC
// @version      0.15
// @description  A userscript for exporting a MangaDex list to a .xml file for import to anime list sites.
// @author       Marv
// @match        https://mangadex.org/list*
// @icon         https://mangadex.org/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/MarvNC/mangadex-list-exporter/master/mangadex-list-exporter.user.js
// @updateURL    https://raw.githubusercontent.com/MarvNC/mangadex-list-exporter/master/mangadex-list-exporter.user.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/FileSaver.min.js
// @grant        none
// ==/UserScript==

// 1000ms delay between requests for MangaDex
const DELAY = 1000;

(function () {
  'use strict';

  // main function that executes on button click
  let save = async () => {
    // disable the button
    btn.onclick = null;
    // get amount of titles (ex. 'Showing 1 to 100 of 420 titles')
    let titleCountElem = document.getElementsByClassName('mt-3 text-center');
    let pages = 1;
    if (titleCountElem[0]) {
      pages = /(?<= of )[0-9,]+(?= titles)/.exec(titleCountElem[0].innerHTML)[0];
      pages = Math.ceil(Number(pages.replace(',', '')) / 100);
    }
    // url without the /chapters/2/ or whatever
    let userID = /(?<=\/list\/)\d+/.exec(document.URL)[0];
    // /0/2/ means list: all (completed, reading, dropped, etc) and in sort mode by alphabetical
    let urlPrefix = `https://mangadex.org/list/${userID}/0/2/`;

    // array of IDs of all the manga on list
    let IDs = [];
    // loop through each page of 100 mangas on list
    for (let i = 1; i <= pages; i++) {
      console.log(`Getting page ${i} of ${pages} pages`);
      btn.innerHTML = `Getting page ${i} of ${pages} list pages`;
      let response = await $.get(urlPrefix + i);
      let doc = document.createElement('html');
      doc.innerHTML = response;
      await timer(DELAY);
      // get the manga IDs on each page
      doc.getElementsByClassName('container')[1].childNodes.forEach((node) => {
        if (node.dataset && node.dataset.id) IDs.push(node.dataset.id);
      });
    }

    console.log(IDs);
    // prettier-ignore
    let xml = 
`<?xml version="1.0" encoding="UTF-8" ?>
	
<!--
Created by Mangadex List Export userscript
Programmed by Marv
Last updated june 2020
-->

<myanimelist>

	<myinfo>
		<user_export_type>2</user_export_type>
	</myinfo>

`;
    // create timer counting down to remaining time
    let countdownTimer = document.createElement('p');
    countdownTimer.style = 'text-align:center;';
    btn.parentElement.appendChild(countdownTimer);

    // loop through each manga ID in IDs
    for (let i = 0; i < IDs.length; i++) {
      console.log(`${i + 1} of ${IDs.length}: Getting details for manga ID: ${IDs[i]}`);
      // update time remaining, accounting for different delays
      countdownTimer.innerHTML = `Export time remaining: ${formatSeconds(
        ((IDs.length - i - 1) * DELAY) / 1000
      )}`;
      // get the info from the manga then add it to xml
      getMangaInfo(IDs[i]).then((mangaInfo) => {
        btn.innerHTML = `${i + 1} of ${IDs.length} entries: Retrieved data for ${
          mangaInfo.mangaTitle
        }`;
        // prettier-ignore
        xml += 
`	<manga>
		<manga_mangadb_id>${mangaInfo.malID}</manga_mangadb_id>
		<manga_mangadex_id>${mangaInfo.mdID}</manga_mangadex_id>
		<manga_anilist_id>${mangaInfo.alID}</manga_anilist_id>
		<manga_kitsu_id>${mangaInfo.kitsuID}</manga_kitsu_id>
		<manga_mangaupdates_id>${mangaInfo.muID}</manga_mangaupdates_id>
		<manga_animeplanet_slug><![CDATA[${mangaInfo.apSlug}]]></manga_animeplanet_slug>
		<manga_title><![CDATA[${mangaInfo.mangaTitle}]]></manga_title>
		<my_read_volumes>${mangaInfo.volume}</my_read_volumes>
		<my_read_chapters>${mangaInfo.chapter}</my_read_chapters>
		<my_start_date>0000-00-00</my_start_date>
		<my_finish_date>0000-00-00</my_finish_date>
		<my_score>${mangaInfo.rating}</my_score>
		<my_status>${mangaInfo.status}</my_status>
		<update_on_import>0</update_on_import>
	</manga>

`;
      });
      await timer(DELAY);
    }
    xml += `</myanimelist>`;
    btn.innerHTML = `Completed list export of ${IDs.length} entries!`;
    // save the xml string as an xml with current date as filename
    let date = new Date();
    let filename = `mangalist_${date.toISOString()}.xml`;
    let blob = new Blob([xml], {
      type: 'application/xml',
    });
    saveAs(blob, filename);
  };

  // the button to add
  var btn = document.createElement('BUTTON');
  btn.innerHTML = `Click to export list; remember to set view mode to 'Simple list'`;
  btn.onclick = save;
  // add the button after user banner
  document.getElementsByClassName('card mb-3')[0].append(btn);
})();

// accepts url of a manga that is on your manga list
var getMangaInfo = (id) => {
  return new Promise(async (resolve, reject) => {
    let url = `https://mangadex.org/title/${id}`;
    let response = await $.get(url).catch((err) => reject(err));
    let doc = document.createElement('html');
    doc.innerHTML = response;
    // the part with status and rating
    let actions = Array.from(doc.getElementsByClassName('col-lg-3 col-xl-2 strong')).find(
      (elem) => elem.innerHTML == 'Actions:'
    );
    let buttons = actions.parentElement.childNodes[3];
    let status =
      actions.parentElement.childNodes[3].childNodes[3].childNodes[0].childNodes[2].innerHTML;
    let rating = Number.parseInt(buttons.childNodes[5].childNodes[1].innerText.replace(' ', ''));
    // rating may be NaN if no rating was set, default to 0 instead
    if (!rating) rating = 0;

    // reading info
    let readinginfo = Array.from(doc.getElementsByClassName('col-lg-3 col-xl-2 strong')).find(
      (elem) => elem.innerHTML == 'Reading progress:'
    );
    let ratings = readinginfo.parentElement.childNodes[3].childNodes[1];
    let volume = Number.parseInt(ratings.childNodes[1].childNodes[1].innerHTML);
    let chapter = Number.parseInt(ratings.childNodes[3].childNodes[1].innerHTML);

    // get IDs of various DBs etc.
    let alID = 0,
      malID = 0,
      kitsuID = 0,
      muID = 0,
      apSlug = 0;
    let extLinks = Array.from(doc.getElementsByClassName('col-lg-3 col-xl-2 strong')).find(
      (elem) => elem.innerHTML == 'Information:'
    );
    if (extLinks) {
      let links = extLinks.parentElement.childNodes[3].childNodes[0];
      // name: name of the link to find, regex: the regex expression to get desired ID or slug
      let getLink = (name, regex) => {
        try {
          let link = Array.from(links.childNodes).find((elem) => {
            if (elem.childNodes[2]) return elem.childNodes[2].innerHTML == name;
          }).childNodes[2].href;
          let result = regex.exec(link);
          // return result, or return 0 if no result
          return result ? result[0] : 0;
        } catch (err) {
          return 0;
        }
      };
      // get the IDs of each
      alID = getLink('AniList', /(?<=manga\/)\d+/);
      malID = getLink('MyAnimeList', /(?<=manga\/)\d+/);
      kitsuID = getLink('Kitsu', /(?<=manga\/)\d+/);
      muID = getLink('MangaUpdates', /(?<=\?id=)\d+/);
      apSlug = getLink('Anime-Planet', /(?<=\/manga\/)[a-z0-9-]+/);
    }

    let mdID = id;
    let mangaTitle = doc.getElementsByClassName('card-header d-flex align-items-center py-2')[0]
      .childNodes[3].innerHTML;

    resolve({
      mangaTitle: mangaTitle,
      status: status,
      rating: rating,
      muID: muID,
      alID: alID,
      apSlug: apSlug,
      kitsuID: kitsuID,
      malID: malID,
      mdID: mdID,
      volume: volume,
      chapter: chapter,
    });
  });
};

// Returns a Promise that resolves after "ms" Milliseconds
var timer = (ms) => {
  return new Promise((res) => setTimeout(res, ms));
};

// seconds to HH:MM:SS
var formatSeconds = (seconds) => {
  return new Date(seconds * 1000).toISOString().substr(11, 8);
};
