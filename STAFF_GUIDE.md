# Plush Comfort UK — Staff & Owner Guide

This guide explains how every part of the Staff & Owner portal works: who can do what, how to log in, how to add products, colours and variations, categories, blogs and pillar pages, and how to change the store design.

Portal address: **https://plushcomfort.uk/admin**. You can also use the **Staff & Owner** button at the right of the thin top bar on every page.

---

## 1. Accounts & logging in

### 1.1 Two kinds of account

| Account | Who | How it is created |
|---|---|---|
| **Owner (Master)** | The store owner. There is only one. | Created once, the very first time anyone opens `/admin`. |
| **Staff** | Team members. | **Only the Owner can create staff logins** (Staff & Roles tab). Staff cannot sign themselves up. |

### 1.2 The login screen has two tabs

**Staff tab**
- Enter your email and password, tick "I'm not a robot" (Google reCAPTCHA), then sign in.
- The Owner account cannot sign in on this tab. Owners use the Owner tab.
- **Forgot password?** Click it, enter your email (and an optional message), and send. This creates a request for the Owner. Nothing is emailed to you. The Owner sets a new password and tells you what it is.

**Owner tab** offers three ways to sign in:
1. **Password.** Email plus password.
2. **Sign in with a code.** Enter your owner email or phone number and choose *Email* or *WhatsApp*. A 6-digit code is sent; enter it to log in. The code expires after 10 minutes, allows 5 attempts, and you can ask for a new one after 60 seconds.
3. **Forgot password.** A code is sent to your email (or WhatsApp). Enter the code and a new password. Every other session is signed out automatically.

> The old "Recovery Key" has been removed. Emergency recovery now uses the email or WhatsApp code above, so keep the owner email and phone number in **My Account** up to date.

### 1.3 Sessions & security
- "Remember me" keeps you logged in for 30 days. Otherwise the session ends when the browser closes.
- Too many wrong passwords from one connection causes a short temporary block.
- The Owner can sign out all their other devices from **Staff & Roles → Sign out my other devices**, and revoke any single session from the Active sessions list.
- When the Owner changes a staff password, that person is signed out on every device straight away.

---

## 2. Staff access (permissions)

Each staff login has a list of **access areas**. A staff member only sees the tabs they have access to, and the server refuses anything outside them.

| Access area | What it unlocks |
|---|---|
| Overview | Dashboard summary (always on) |
| Products | Add, edit and delete products, prices, stock, colours and variations |
| Categories & SEO | Create, preview, edit, hide and delete categories, plus their SEO |
| Content | Blogs, guides, articles and pillar pages |
| Store Design | Homepage, header/top bar, mega menu, footer, brand assets |
| Orders | View orders and change their status |
| Analytics | Traffic and sales analytics |
| Settings & SEO | Global settings and default SEO and social image |
| Activity Logs | Store-change logs |

Ready-made roles (you can tick or untick any area when creating or editing a login):
- **Admin**: everything except Staff & Roles.
- **Editor**: Products, Categories, Content.
- **Marketer**: Categories, Content, Store Design.

**Categories & SEO is switched on by default** for every role.

Each staff member's **Overview** only shows numbers for the areas they can access. For example, an editor sees product, stock and content counts but no revenue.

---

## 3. Owner tools (Staff & Roles tab)

- **Create login.** Enter name, email and role, then tick the access areas. Type a password or use **Generate**. Give the email and password to the staff member.
- **Edit.** Change the name, role or access, or disable the account.
- **Set password.** Choose a new password for any staff member. This signs them out everywhere.
- **Password reset requests.** Requests from the staff "Forgot password?" link appear here. Click **Set new password** or **Dismiss**.
- **History.** Shows everything for one person: account created, password set or changed, logins (password or code), logouts, failed attempts and changes they made.
- **Active sessions.** Every signed-in device for every account, with **Revoke**.

### 3.1 Logs (Activity Logs tab)
- **Store changes**: product, category, blog, design and order changes, showing who made each change and a short summary (for example "Price changed £899 → £799").
- **Security & technical** (Owner only): logins, logouts, failed logins, OTP codes sent, password creations and changes, session revokes, uploads and errors.
- **Export Audit CSV** downloads the logs as a spreadsheet file.

The **Owner Overview** shows a WooCommerce-style summary: revenue, orders, average order value, a monthly sales chart, top products, low and out-of-stock inventory, recent orders, recent store changes and recent technical events.

---

## 4. Products

Go to **Products → Add product** (or click a product to edit it).

### 4.1 Basics
Name, slug (the URL), category, regular price, sale price, stock and descriptions.

On the product page customers see **only the regular price and the sale price**.

### 4.2 Colours (standard variation)
- In **Colours** click **Add colour**. Give it a name (e.g. "Silver Grey") and pick the swatch colour.
- **Upload photos for that colour** (or choose from the product's existing photos).
- On the website, clicking a colour swatch changes the gallery to that colour's photos. A colour with no photos keeps showing the main photos.

### 4.3 Size & configuration variations
- Use **"+ Add Custom Variation…"** to choose exactly which variation to add from the list: sofa sizes, 3+2 or 3+3 suites, left or right corners, U-shapes, bed sizes (Single, Small Double, Double, King, Super King), divan or ottoman storage, headboard heights, mattress options, and more.
- You can still pick **"Blank custom variation"** and type your own.
- For each variation set the price, sale price, stock, SKU and an optional **photo**. The photo is shown when the customer selects that variation.
- Customers pick a colour and a variation separately. The price shown is the price of the chosen variation.

### 4.4 SEO
Meta title, meta description, canonical URL, robots, and **Social share image**. The share image is used for Facebook, WhatsApp, LinkedIn and X/Twitter cards. If you leave it empty, the product's main image is used.

---

## 5. Categories (Categories & SEO tab)

- **Add category**: name, slug, parent (to make it a sub-category), description, image, SEO fields and social share image.
- **Preview** opens the live category page.
- **Hide / Show** removes the category from the menu and site without deleting it.
- **Delete** removes the category. Products in it are not deleted; move them to another category first.
- Slugs must be unique and contain only lowercase letters, numbers and hyphens.

---

## 6. Blogs, guides, articles & pillar pages (Content tab)

### 6.1 Content types
- **Pillar page**: a long, complete guide on a main topic (e.g. "UK Sofa Buying Guide"). It gets the large pillar layout.
- **Cluster article / blog / guide**: a shorter post on one sub-topic. Choose its **Pillar** in "Parent pillar". The post then appears as a card on the pillar page and links back to it.

### 6.2 Feature (cover) image
Upload a cover image. It is shown on the homepage guides section, the blog page and the top of the post. It is also the social share image unless you upload a separate one in the SEO tab.

### 6.3 Body tools (editor toolbar)

| Button | What it inserts |
|---|---|
| Image | Uploads an image (auto-converted to WebP) and inserts it with a caption |
| Carousel | A slider of several images |
| Chart | A bar, line or pie chart. Type the values, or paste CSV |
| Tip | A highlighted tip box |
| Steps | A numbered step list |
| Checklist | A tick list |
| FAQ | Question and answer pairs (also added to Google FAQ data) |
| CTA | A call-to-action box with a button |
| Products | Product cards for chosen product IDs |

The text format behind these blocks, if you prefer to type it:

```
![Alt text](/uploads/blog/photo.webp "Caption")

:::carousel
/uploads/blog/a.webp | First caption
/uploads/blog/b.webp | Second caption
:::

:::chart bar Sofa depth by type unit=cm
Standard sofa: 90
Corner sofa: 95
:::

:::tip
Measure doorways before ordering.
:::

:::cta Ready to choose? | Shop sofas | /category/sofas
:::

:::products prod-216,prod-194
:::
```

The **Preview** tab shows the post exactly as it will look.

### 6.4 Pillar page sections (all editable)
In **Pillar page layout** you can edit the small label above the title, the two hero buttons (text and link), and the closing banner title, text, button text and button link.

The page then builds automatically, in this order:
1. Reading progress bar.
2. Hero.
3. Sticky table of contents.
4. Numbered chapters.
5. Key takeaways.
6. Cluster article cards.
7. FAQ accordion.
8. Related products.
9. Author box.
10. Share buttons.
11. Closing CTA band.

**Key takeaways** and **FAQs** have their own fields in the editor.

### 6.5 SEO for posts
Use the SEO tab for meta title, description, canonical, robots and the social share image. Article, Breadcrumb and FAQ structured data are generated automatically.

---

## 7. Store Design tab

There is now **one** Store Design tab. The old "Homepage Sections" and "Store Hero Section" have been merged.

- **Homepage**
  - Hero headline, text and buttons.
  - **Showcase products**: pick the products shown in the big hero image. Thumbnails switch the image.
  - **Trust points** under the hero.
  - **Workshop/Video button** (section 7.1).
  - Section on/off and order.
- **Header & top bar**
  - Ticker text (scrolls like a news ticker in the middle).
  - Show or hide social icons and phone/email.
- **Mega menu**: menu columns and images.
- **Footer**
  - Facebook, Instagram, Pinterest, TikTok, YouTube and LinkedIn links. Icons only appear for links that are filled in, in both the top bar and the footer.
  - **Trust badges**: the 4 badges above the footer (Free Delivery, 30-Day Exchange/Return, Cash on Delivery, Customer Support). You can edit their titles and text.
- **Brand assets**: logo and favicon.

Click **Save** once to save everything on this tab.

### 7.1 The video button (previously "Workshop Tour")
1. Store Design → Homepage → **Video button**.
2. Either paste a **YouTube or Vimeo link**, or **upload an MP4/WebM** file (max 20 MB; for longer videos use YouTube).
3. Set the button text (e.g. "Watch Our Story") and an optional title and description.
4. Turn on **Show video button** and Save.

If the video link is empty, the button is hidden automatically.

---

## 8. Settings & Global SEO tab
- Site title suffix, default meta description, and Google or Bing verification codes.
- **Default social share image**: used when a page has no image of its own.
- Contact phone, WhatsApp, email and business hours. These are shown in the top bar, footer and contact page.

### 8.1 How the social (OG/Twitter) image is chosen
1. The page's own **Social share image** (SEO tab), if one is uploaded.
2. Otherwise the page's feature image (product main photo, category image, or blog cover).
3. Otherwise the **Default social share image** from Settings.

---

## 9. Images: automatic WebP
- Every image you upload (products, colours, variations, blogs, categories, SEO images, logo) is **converted to WebP and compressed to under ~200 KB** before upload, at up to 1600 px wide. Quality stays high and pages load faster.
- You can upload JPG, PNG or WebP; the conversion happens automatically.
- Best results: upload landscape photos about 1600 px wide, well lit, with no text baked in.

---

## 10. Orders
- New orders appear in **Orders** with the customer's details and the chosen colour and variation.
- Change the status (Pending → Processing → Dispatched → Delivered, or Cancelled). Every change is logged.
- Payment is **Cash on Delivery**.

---

## 11. Quick FAQ for staff

**I can't see a tab.** You don't have access to that area. Ask the Owner.

**I forgot my password.** Use "Forgot password?" on the Staff tab, then wait for the Owner to set a new one.

**My change isn't showing on the website.** Saving is automatic, a couple of seconds after each change. Refresh the website page. If the site is not connected to a database, see `SETUP_DATABASE_AND_SERVICES.md`.

**Can I undo a deletion?** No. Hide categories or set products out of stock instead of deleting them, if you are unsure.
