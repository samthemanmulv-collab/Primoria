# Primoria Platform V7

V7 is a platform-first release built on the verified V6 course content.

## New in V7
- Redesigned Library with search, school filter, and verified/exploratory separation.
- Visible Source & Edition provenance on Library cards, course pages, reading pages, and a dedicated Sources page.
- Canonical Project Gutenberg landing-page links for every verified course source.
- Author profiles for Julius Caesar, Plato, Aristotle, Augustine, and Machiavelli.
- Three reading modes:
  - Guided: orientation, primary text, vocabulary, close reading, comparison, reflection.
  - Reader: clean primary text with minimal interface and provenance.
  - Seminar: paragraph numbering, source record, vocabulary, close reading, and discussion lens.
- Bookmarking for verified readings.
- Improved completion tracking: close-reading completion occurs after all questions are answered; any mode can also mark a reading complete.
- Improved Journey dashboard.
- V6 local progress migrates automatically into V7 on the same browser.
- Network-first V7 service worker so new GitHub Pages deployments replace stale cached builds more reliably.

## Deploy
Upload the extracted files and folders to the root of the Primoria GitHub repository, commit to `main`, and let GitHub Pages deploy from `main / (root)`.

After deployment, a hard refresh should show `Primoria Platform V7` in the footer.
