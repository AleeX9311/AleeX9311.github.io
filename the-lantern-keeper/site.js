function esc(value) {
  return String(value ?? "").replace(/[&<>]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
}
function inline(text) {
  return esc(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
}
function markdown(src) {
  return String(src || "").trim().split(/\n\n+/).map(block => {
    if (block.startsWith("## ")) return `<h2>${inline(block.slice(3))}</h2>`;
    if (block.startsWith("> ")) return `<blockquote><p>${inline(block.replace(/^>\s?/gm, ""))}</p></blockquote>`;
    return `<p>${inline(block).replace(/\n/g, "<br>")}</p>`;
  }).join("");
}
function prettyDate(iso) {
  const match = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso || "";
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
}
async function loadPosts() {
  const response = await fetch("posts.json");
  if (!response.ok) throw new Error("posts");
  const posts = await response.json();
  return posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
function card(post) {
  return `<a class="card post-card" href="post.html?slug=${encodeURIComponent(post.slug)}">
    <time datetime="${esc(post.date)}">${esc(prettyDate(post.date))}</time>
    <h3>${esc(post.title)}</h3>
    <p>${esc(post.excerpt)}</p>
  </a>`;
}
async function paintList(node, limit) {
  if (!node) return;
  try {
    const posts = await loadPosts();
    node.innerHTML = posts.slice(0, limit || posts.length).map(card).join("");
  } catch (error) {
    node.innerHTML = `<p>The journal could not be loaded. Check that posts.json sits next to this page.</p>`;
  }
}
async function paintPost() {
  const node = document.getElementById("post");
  if (!node) return;
  const slug = new URLSearchParams(location.search).get("slug");
  try {
    const posts = await loadPosts();
    const post = posts.find(item => item.slug === slug);
    if (!post) {
      node.innerHTML = `<p>That entry is not in the journal. <a href="blog.html">Back to the journal</a>.</p>`;
      return;
    }
    document.title = post.title + " · The Lantern Keeper";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", post.excerpt);
    node.innerHTML = `<p class="kicker">From the journal</p><h1>${esc(post.title)}</h1>
      <time datetime="${esc(post.date)}">${esc(prettyDate(post.date))}</time>
      <div class="prose">${markdown(post.body)}</div>
      <p><a href="blog.html">All entries</a></p>`;
  } catch (error) {
    node.innerHTML = `<p>The journal could not be loaded.</p>`;
  }
}
function bindForms() {
  document.querySelectorAll("form[data-thanks]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form);
      const box = form.parentElement.querySelector("[data-thanks-box]");
      const name = String(data.get("name") || "").trim();
      const slot = box.querySelector("[data-name]");
      if (slot) slot.textContent = name;
      form.hidden = true;
      box.hidden = false;
      if (box && typeof box.focus === "function") box.focus();
    });
  });
}
bindForms();
paintList(document.getElementById("latest"), 3);
paintList(document.getElementById("posts"));
paintPost();
