import * as convert$1 from "xml-js";
import * as convert from "xml-js";

//#region src/config/index.ts
const generator = "https://github.com/jpmonette/feed";

//#endregion
//#region src/utils.ts
function sanitize(url) {
	if (typeof url === "undefined") return;
	return url.replace(/&/g, "&amp;");
}

//#endregion
//#region src/atom1.ts
/**
* Returns an Atom feed
* @param ins
*/
var atom1_default = (ins) => {
	const { options } = ins;
	const base = {
		_declaration: { _attributes: {
			version: "1.0",
			encoding: "utf-8"
		} },
		_instruction: {},
		feed: {
			_attributes: { xmlns: "http://www.w3.org/2005/Atom" },
			id: options.id,
			title: options.title,
			updated: options.updated ? options.updated.toISOString() : new Date().toISOString(),
			generator: sanitize(options.generator ?? generator)
		}
	};
	if (options.stylesheet) base._instruction = { "xml-stylesheet": { _attributes: {
		href: options.stylesheet,
		type: "text/xsl"
	} } };
	else delete base._instruction;
	if (options.author) base.feed.author = formatAuthor(options.author);
	base.feed.link = [];
	if (options.link) base.feed.link.push({ _attributes: {
		rel: "alternate",
		href: sanitize(options.link)
	} });
	const atomLink = options.feed ?? (options.feedLinks && options.feedLinks.atom);
	if (atomLink) base.feed.link.push({ _attributes: {
		rel: "self",
		href: sanitize(atomLink)
	} });
	if (options.hub) base.feed.link.push({ _attributes: {
		rel: "hub",
		href: sanitize(options.hub)
	} });
	/**************************************************************************
	* "feed" node: optional elements
	*************************************************************************/
	if (options.description) base.feed.subtitle = options.description;
	if (options.image) base.feed.logo = options.image;
	if (options.favicon) base.feed.icon = options.favicon;
	if (options.copyright) base.feed.rights = options.copyright;
	base.feed.category = [];
	ins.categories.forEach((category) => {
		base.feed.category.push({ _attributes: { term: category } });
	});
	base.feed.contributor = [];
	ins.contributors.forEach((contributor) => {
		base.feed.contributor.push(formatAuthor(contributor));
	});
	base.feed.entry = [];
	/**************************************************************************
	* "entry" nodes
	*************************************************************************/
	ins.items.forEach((item) => {
		const entry = {
			title: {
				_attributes: { type: "html" },
				_cdata: item.title
			},
			id: sanitize(item.id ?? item.link),
			link: [{ _attributes: { href: sanitize(item.link) } }],
			updated: item.date.toISOString()
		};
		if (item.description) entry.summary = {
			_attributes: { type: "html" },
			_cdata: item.description
		};
		if (item.content) entry.content = {
			_attributes: { type: "html" },
			_cdata: item.content
		};
		if (Array.isArray(item.author)) {
			entry.author = [];
			item.author.forEach((author) => {
				entry.author.push(formatAuthor(author));
			});
		}
		if (Array.isArray(item.category)) {
			entry.category = [];
			item.category.forEach((category) => {
				entry.category.push(formatCategory$1(category));
			});
		}
		/**
		* Item Enclosure
		* https://validator.w3.org/feed/docs/atom.html#link
		*/
		if (item.enclosure) entry.link.push(formatEnclosure$1(item.enclosure));
		if (item.image) entry.link.push(formatEnclosure$1(item.image, "image"));
		if (item.audio) entry.link.push(formatEnclosure$1(item.audio, "audio"));
		if (item.video) entry.link.push(formatEnclosure$1(item.video, "video"));
		if (item.contributor && Array.isArray(item.contributor)) {
			entry.contributor = [];
			item.contributor.forEach((contributor) => {
				entry.contributor.push(formatAuthor(contributor));
			});
		}
		if (item.published) entry.published = item.published.toISOString();
		if (item.copyright) entry.rights = item.copyright;
		base.feed.entry.push(entry);
	});
	return convert$1.js2xml(base, {
		compact: true,
		ignoreComment: true,
		spaces: 4
	});
};
/**
* Returns a formatted author
* @param author
*/
const formatAuthor = (author) => {
	const { name, email, link } = author;
	const out = { name };
	if (email) out.email = email;
	if (link) out.uri = sanitize(link);
	return out;
};
/**
* Returns a formated enclosure
* @param enclosure
* @param mimeCategory
*/
const formatEnclosure$1 = (enclosure, mimeCategory = "image") => {
	if (typeof enclosure === "string") {
		const type$1 = new URL(enclosure).pathname.split(".").slice(-1)[0];
		return { _attributes: {
			rel: "enclosure",
			href: enclosure,
			type: `${mimeCategory}/${type$1}`
		} };
	}
	const type = new URL(enclosure.url).pathname.split(".").slice(-1)[0];
	return { _attributes: {
		rel: "enclosure",
		href: enclosure.url,
		title: enclosure.title,
		type: `${mimeCategory}/${type}`,
		length: enclosure.length
	} };
};
/**
* Returns a formatted category
* @param category
*/
const formatCategory$1 = (category) => {
	const { name, scheme, term } = category;
	return { _attributes: {
		label: name,
		scheme,
		term
	} };
};

//#endregion
//#region src/json.ts
/**
* Returns a JSON feed
* @param ins
*/
var json_default = (ins) => {
	const { options, items, extensions } = ins;
	const feed = {
		version: "https://jsonfeed.org/version/1",
		title: options.title
	};
	if (options.link) feed.home_page_url = options.link;
	if (options.feedLinks && options.feedLinks.json) feed.feed_url = options.feedLinks.json;
	if (options.description) feed.description = options.description;
	if (options.image) feed.icon = options.image;
	if (options.author) {
		feed.author = {};
		if (options.author.name) feed.author.name = options.author.name;
		if (options.author.link) feed.author.url = options.author.link;
		if (options.author.avatar) feed.author.avatar = options.author.avatar;
	}
	extensions.forEach((e) => {
		feed[e.name] = e.objects;
	});
	feed.items = items.map((item) => {
		const feedItem = {
			id: item.id,
			content_html: item.content ?? item.description
		};
		if (item.link) feedItem.url = item.link;
		if (item.title) feedItem.title = item.title;
		if (item.description && item.content) feedItem.summary = item.description;
		if (item.image) feedItem.image = item.image;
		if (item.date) feedItem.date_modified = item.date.toISOString();
		if (item.published) feedItem.date_published = item.published.toISOString();
		if (item.author) {
			let author = item.author;
			if (author instanceof Array) author = author[0];
			feedItem.author = {};
			if (author.name) feedItem.author.name = author.name;
			if (author.link) feedItem.author.url = author.link;
			if (author.avatar) feedItem.author.avatar = author.avatar;
		}
		if (Array.isArray(item.category)) {
			feedItem.tags = [];
			item.category.forEach((category) => {
				if (category.name) feedItem.tags.push(category.name);
			});
		}
		if (item.extensions) item.extensions.forEach((e) => {
			feedItem[e.name] = e.objects;
		});
		return feedItem;
	});
	return JSON.stringify(feed, null, 4);
};

//#endregion
//#region src/rss2.ts
/**
* Returns a RSS 2.0 feed
*/
var rss2_default = (ins) => {
	const { options, extensions } = ins;
	let needsAtomNamespace = false;
	let needsContentNamespace = false;
	const base = {
		_declaration: { _attributes: {
			version: "1.0",
			encoding: "utf-8"
		} },
		_instruction: {},
		rss: {
			_attributes: { version: "2.0" },
			channel: {
				title: { _text: options.title },
				link: { _text: sanitize(options.link) },
				description: { _text: options.description ?? "" },
				lastBuildDate: { _text: options.updated ? options.updated.toUTCString() : new Date().toUTCString() },
				docs: { _text: options.docs ? options.docs : "https://validator.w3.org/feed/docs/rss2.html" },
				generator: { _text: options.generator ?? generator }
			}
		}
	};
	if (options.stylesheet) base._instruction = { "xml-stylesheet": { _attributes: {
		href: options.stylesheet,
		type: "text/xsl"
	} } };
	else delete base._instruction;
	/**
	* Channel language
	* https://validator.w3.org/feed/docs/rss2.html#ltlanguagegtSubelementOfLtchannelgt
	*/
	if (options.language) base.rss.channel.language = { _text: options.language };
	/**
	* Channel ttl
	* https://validator.w3.org/feed/docs/rss2.html#ltttlgtSubelementOfLtchannelgt
	*/
	if (options.ttl) base.rss.channel.ttl = { _text: options.ttl };
	/**
	* Channel Image
	* https://validator.w3.org/feed/docs/rss2.html#ltimagegtSubelementOfLtchannelgt
	*/
	if (options.image) base.rss.channel.image = {
		title: { _text: options.title },
		url: { _text: options.image },
		link: { _text: sanitize(options.link) }
	};
	/**
	* Channel Copyright
	* https://validator.w3.org/feed/docs/rss2.html#optionalChannelElements
	*/
	if (options.copyright) base.rss.channel.copyright = { _text: options.copyright };
	/**
	* Channel Categories
	* https://validator.w3.org/feed/docs/rss2.html#comments
	*/
	ins.categories.forEach((category) => {
		if (!base.rss.channel.category) base.rss.channel.category = [];
		base.rss.channel.category.push({ _text: category });
	});
	/**
	* Feed URL
	* http://validator.w3.org/feed/docs/warning/MissingAtomSelfLink.html
	*/
	const atomLink = options.feed ?? (options.feedLinks && options.feedLinks.rss);
	if (atomLink) {
		needsAtomNamespace = true;
		if (!base.rss.channel["atom:link"]) base.rss.channel["atom:link"] = [];
		base.rss.channel["atom:link"].push({ _attributes: {
			href: sanitize(atomLink),
			rel: "self",
			type: "application/rss+xml"
		} });
	}
	/**
	* Hub for PubSubHubbub
	* https://code.google.com/p/pubsubhubbub/
	*/
	if (options.hub) {
		needsAtomNamespace = true;
		if (!base.rss.channel["atom:link"]) base.rss.channel["atom:link"] = [];
		base.rss.channel["atom:link"].push({ _attributes: {
			href: sanitize(options.hub),
			rel: "hub"
		} });
	}
	/**
	* Channel Categories
	* https://validator.w3.org/feed/docs/rss2.html#hrelementsOfLtitemgt
	*/
	base.rss.channel.item = [];
	ins.items.forEach((entry) => {
		const item = {};
		if (entry.title) item.title = { _cdata: entry.title };
		if (entry.link) item.link = { _text: sanitize(entry.link) };
		if (entry.guid) item.guid = {
			_text: entry.guid,
			_attributes: { isPermaLink: false }
		};
		else if (entry.id) item.guid = {
			_text: entry.id,
			_attributes: { isPermaLink: false }
		};
		else if (entry.link) item.guid = {
			_text: sanitize(entry.link),
			_attributes: { isPermaLink: true }
		};
		if (entry.date) item.pubDate = { _text: entry.date.toUTCString() };
		if (entry.published) item.pubDate = { _text: entry.published.toUTCString() };
		if (entry.description) item.description = { _cdata: entry.description };
		if (entry.content) {
			needsContentNamespace = true;
			item["content:encoded"] = { _cdata: entry.content };
		}
		/**
		* Item Author
		* https://validator.w3.org/feed/docs/rss2.html#ltauthorgtSubelementOfLtitemgt
		*/
		if (Array.isArray(entry.author)) {
			item.author = [];
			entry.author.forEach((author) => {
				if (author.email && author.name) item.author.push({ _text: author.email + " (" + author.name + ")" });
				else if (author.name) item.author.push({ _text: author.name });
			});
		}
		/**
		* Item Category
		* https://validator.w3.org/feed/docs/rss2.html#ltcategorygtSubelementOfLtitemgt
		*/
		if (Array.isArray(entry.category)) {
			item.category = [];
			entry.category.forEach((category) => {
				item.category.push(formatCategory(category));
			});
		}
		/**
		* Item Enclosure
		* https://validator.w3.org/feed/docs/rss2.html#ltenclosuregtSubelementOfLtitemgt
		*/
		if (entry.enclosure) item.enclosure = formatEnclosure(entry.enclosure);
		if (entry.image) item.enclosure = formatEnclosure(entry.image, "image");
		if (entry.audio) {
			let duration = void 0;
			if (options.podcast && typeof entry.audio !== "string" && entry.audio.duration) {
				duration = entry.audio.duration;
				entry.audio.duration = void 0;
			}
			item.enclosure = formatEnclosure(entry.audio, "audio");
			if (duration) item["itunes:duration"] = formatDuration(duration);
		}
		if (entry.video) item.enclosure = formatEnclosure(entry.video, "video");
		if (entry.extensions) entry.extensions.forEach((extension) => {
			item[extension.name] = extension.objects;
		});
		base.rss.channel.item.push(item);
	});
	if (needsContentNamespace) {
		base.rss._attributes["xmlns:dc"] = "http://purl.org/dc/elements/1.1/";
		base.rss._attributes["xmlns:content"] = "http://purl.org/rss/1.0/modules/content/";
	}
	if (extensions) extensions.forEach((e) => {
		base.rss.channel[e.name] = e.objects;
	});
	if (needsAtomNamespace) base.rss._attributes["xmlns:atom"] = "http://www.w3.org/2005/Atom";
	/**
	* Podcast extensions
	* https://support.google.com/podcast-publishers/answer/9889544?hl=en
	*/
	if (options.podcast) {
		base.rss._attributes["xmlns:googleplay"] = "http://www.google.com/schemas/play-podcasts/1.0";
		base.rss._attributes["xmlns:itunes"] = "http://www.itunes.com/dtds/podcast-1.0.dtd";
		if (options.category) {
			base.rss.channel["googleplay:category"] = options.category;
			base.rss.channel["itunes:category"] = options.category;
		}
		if (options.author?.email) {
			base.rss.channel["googleplay:owner"] = options.author.email;
			base.rss.channel["itunes:owner"] = { "itunes:email": options.author.email };
		}
		if (options.author?.name) {
			base.rss.channel["googleplay:author"] = options.author.name;
			base.rss.channel["itunes:author"] = options.author.name;
		}
		if (options.image) base.rss.channel["googleplay:image"] = { _attributes: { href: sanitize(options.image) } };
	}
	return convert.js2xml(base, {
		compact: true,
		ignoreComment: true,
		spaces: 4
	});
};
/**
* Returns a formated enclosure
* @param enclosure
* @param mimeCategory
*/
const formatEnclosure = (enclosure, mimeCategory = "image") => {
	if (typeof enclosure === "string") {
		const type$1 = new URL(sanitize(enclosure)).pathname.split(".").slice(-1)[0];
		return { _attributes: {
			url: enclosure,
			length: 0,
			type: `${mimeCategory}/${type$1}`
		} };
	}
	const type = new URL(sanitize(enclosure.url)).pathname.split(".").slice(-1)[0];
	return { _attributes: {
		length: 0,
		type: `${mimeCategory}/${type}`,
		...enclosure
	} };
};
/**
* Returns a formated category
* @param category
*/
const formatCategory = (category) => {
	const { name, domain } = category;
	return {
		_text: name,
		_attributes: { domain }
	};
};
/**
* Returns a formated duration from seconds
* @param duration
*/
const formatDuration = (duration) => {
	const seconds = duration % 60;
	const totalMinutes = Math.floor(duration / 60);
	const minutes = totalMinutes % 60;
	const hours = Math.floor(totalMinutes / 60);
	const notHours = ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
	return hours > 0 ? hours + ":" + notHours : notHours;
};

//#endregion
//#region src/feed.ts
/**
* Class used to generate Feeds
*/
var Feed = class {
	items = [];
	categories = [];
	contributors = [];
	extensions = [];
	constructor(options) {
		this.options = options;
	}
	/**
	* Add a feed item
	* @param item
	*/
	addItem = (item) => this.items.push(item);
	/**
	* Add a category
	* @param category
	*/
	addCategory = (category) => this.categories.push(category);
	/**
	* Add a contributor
	* @param contributor
	*/
	addContributor = (contributor) => this.contributors.push(contributor);
	/**
	* Adds an extension
	* @param extension
	*/
	addExtension = (extension) => this.extensions.push(extension);
	/**
	* Returns a Atom 1.0 feed
	*/
	atom1 = () => atom1_default(this);
	/**
	* Returns a RSS 2.0 feed
	*/
	rss2 = () => rss2_default(this);
	/**
	* Returns a JSON1 feed
	*/
	json1 = () => json_default(this);
};

//#endregion
export { Feed };
//# sourceMappingURL=feed.js.map