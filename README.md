# ML Wholesale — storefront site

A single-page wholesale/retail showcase site: hero with layered parallax, a swipeable
featured-deals carousel, and a catalog split into categorized sections (electronics,
home, apparel, tools, toys), each with its own layout and scroll-triggered animation.
Every listing has an inline **Make an Offer** box that opens a small form and sends the
offer straight to your email.

No build step — it's plain HTML/CSS/JS. Open `index.html` in a browser, or serve the
folder with any static server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Adding your real eBay listings

Your listing data could not be pulled automatically — this environment's network policy
blocks outbound requests to ebay.com. Edit `assets/data/products.json` and replace the
sample entries with your real ones. Each item looks like this:

```json
{
  "id": "p01",
  "title": "Your exact eBay listing title",
  "price": 89.99,
  "category": "electronics",
  "condition": "New",
  "moq": "Lot of 50"
}
```

`category` must be one of: `electronics`, `home`, `apparel`, `tools`, `toys` — that's
what routes an item into the right section on the page. Add more categories in
`assets/js/app.js` (the `CATEGORIES` array near the top) if you need them.

## Adding real photos

Until real photos are added, every card shows a "Photo Pending" placeholder tile so
nothing looks like a fake stock photo. To use real photos:

1. Drop image files into a new `assets/img/` folder.
2. In `assets/data/products.json`, add an `"image": "assets/img/yourfile.jpg"` field to
   each product.
3. In `assets/js/app.js`, in the `productCard()` function, swap the placeholder
   `photoTile(p.category)` call for an `<img src="${p.image}" alt="${p.title}">` when
   `p.image` is present.

## Contact / offers

The "Make an Offer" form and footer email both point at the address in
`assets/js/app.js` (`OWNER_EMAIL` near the top) — update it there if it ever changes.

## Deploying

This is static — push it to GitHub Pages, Netlify, Vercel, or any static host with no
configuration needed.
