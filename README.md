# Cortec Middle East — website (static build)

The new cortec-me.com website, built by Velorien. It is a static site: plain HTML, CSS and JavaScript, with no server code and no database. It runs on any host.

## What's inside

| Path | What it is |
|---|---|
| `index.html`, `about-us/`, `solutions/`, … | 293 English pages, including all 122 case studies and 80 news posts and articles from the old site. Each page keeps the old site's URL. |
| `ar/…` | 117 Arabic (RTL) pages, linked to the English pages with `hreflang`. Includes 12 case studies and 14 articles in Arabic. |
| `products/<product>/` | One page per product (54), in English and Arabic. |
| `<old-slug>/index.html` (18) | Redirect pages for old WordPress URLs that were merged into other pages. |
| `admin/` | The content manager (Decap CMS). It only works on the CMS-enabled hosting described in the source package's README. |
| `assets/` | `css/site.css`, `js/site.js`, `js/data.js`, `js/config.js`, the search indexes, fonts, images and videos. |
| `sitemap.xml`, `robots.txt` | Search engine files. The sitemap includes the Arabic alternates. |
| `_redirects`, `.htaccess`, `nginx-redirects.conf`, `vercel.json` | Real 301 redirects. Use the one that matches your host. |
| `redirects.csv` | The complete URL map: every old URL and its new URL, for the client to sign off. |
| `404.html`, `ar/404.html` | "Page not found" pages. |
| `tools/mirror-uploads.py` + `tools/uploads-manifest.txt` | Copies the old site's images and PDFs into the new site. See step 1 below. |

## Preview (GitHub Pages)

Push the whole folder to a repository and turn on Pages (branch `main`, folder `/root`). The preview works under `https://<user>.github.io/<repo>/` because every link is relative.

On any host other than cortec-me.com, the site automatically:

- tells search engines not to index it, and
- does not load analytics.

So the preview can never compete with the live site in Google.

## Go-live checklist

1. **Mirror the WordPress uploads. Do this before you change DNS.**
   Images, data sheets (TDS) and brochures still load from `https://cortec-me.com/wp-content/uploads/…`. Once the domain points at the new host, those files disappear unless you copy them first.
   Run `python3 tools/mirror-uploads.py` from the site folder while the old site is still online. It downloads every referenced file (about 310) into `wp-content/uploads/…`, keeping the same paths. Deploy that folder with the site, and every URL keeps working, including Google Images and external links to the PDFs.
2. **Connect the forms.**
   Open `assets/js/config.js` and set `formEndpoint` to your form service URL, for example Formspree, Basin or Getform. This connects the contact form, the newsletter and the gated rig lay-up manuals.
   Until you do this:
   - the contact form and newsletter open the visitor's email app, addressed to inquiries@cortec-me.com;
   - the manuals still download, but the lead is not captured.
3. **Analytics.**
   `gtmId` is preset to the current container, `GTM-WG9B49J`. Google Tag Manager loads only on cortec-me.com, and only after the visitor clicks "Accept all" (Google Consent Mode v2, defaults denied). Inside GTM, make sure the GA4 tag respects consent.
   Leads are pushed to `dataLayer` as `generate_lead`, with `form_type` set to `quote`, `consult`, `general` or `manuals`. Newsletter sign-ups are pushed as `newsletter_signup`.
4. **Choose a host and turn on its redirects.**
   - **Netlify or Cloudflare Pages (recommended):** `_redirects` is picked up automatically and gives true 301s.
   - **Apache or cPanel:** `.htaccess` is included. It also forces https and the bare domain, adds security headers and sets caching.
   - **nginx:** `include nginx-redirects.conf;` inside the server block.
   - **Vercel:** `vercel.json`.
   - **GitHub Pages:** rename `CNAME.example` to `CNAME`. GitHub can't send server 301s, so the redirect pages handle it instead (canonical tag plus an instant refresh).
5. **DNS.** Change only the website records:
   - the `A`/`AAAA` records for `cortec-me.com`
   - the `CNAME` record for `www`

   **Leave the MX records alone**, or the inquiries@cortec-me.com mailbox will stop receiving mail. Turn on HTTPS at the host.
6. **After launch:**
   - In Google Search Console, verify the domain property and submit `https://cortec-me.com/sitemap.xml`.
   - Watch the "Pages" report for 404s during the first two weeks and add any missing redirects to `redirects.csv` and your host's redirect file.
   - Do the same in Bing Webmaster Tools.
7. **Still to come from Cortec:**
   - product photography (product pages currently show a category icon)
   - the WhatsApp Business number (the floating button uses the landline for now)
   - a client testimonial
   - the old Arabic URLs, if they differed from `/ar/<same-slug>/`, so they can be redirected too

## SEO built in

- A unique `<title>` and meta description on every page; one H1 per page.
- `canonical` links and `hreflang` pairs (en / ar / x-default).
- Open Graph and Twitter cards, with a default social image at `assets/img/og-default.jpg`.
- Structured data (JSON-LD):
  - `Organization` on every page
  - `WebSite` on the home page
  - `BreadcrumbList` on every inner page
  - `Product` on the 54 product pages
  - `Article`, `NewsArticle` or `BlogPosting` on case studies and articles
- `sitemap.xml` (with alternates) and `robots.txt`; all old URLs mapped with 301s.
- Internal linking: product names in articles link to their product pages. Every product, category, application and industry page links to related pages.
- Speed:
  - self-hosted fonts are preloaded
  - the hero image gets `fetchpriority="high"`; other images use lazy loading and async decoding
  - the search index loads only when someone first opens search
  - scripts use `defer`

## Accessibility (WCAG 2.1 AA)

Checked with axe-core. What's in place:

- A skip link on every page.
- Visible keyboard focus.
- Keyboard focus is trapped inside open dialogs.
- Labelled form fields with error messages.
- `aria-current` on the current navigation item.
- A combobox pattern for search.
- Reduced-motion support: with it on, all animation is skipped.

The brand green, #029d58, is kept for large type and graphics. Small text and button fills use a slightly deeper tone of the same green (#027a45 and #02854b) so they meet the 4.5:1 contrast ratio.

## Editing

This folder is the built output. The editable source (content files, build script and the content manager at `/admin/`) is in the separate source package; see its README.
