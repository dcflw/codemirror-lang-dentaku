/**
 * @param {Record<string, unknown>} packageJson
 * @param {{ exec: typeof exec; context: typeof context; fetch: typeof fetch }} params
 */
async function bumpPackageVersion(packageJson, { exec, context, fetch }) {
  const npmRegistryUrl = "https://registry.npmjs.org";

  const currentPackageVersion = await fetch(
    `${npmRegistryUrl}/${packageJson.name}`
  )
    .then(async (res) => (await res.json()).versions)
    .then((versions) =>
      Object.keys(versions)
        .sort((a, b) => a.localeCompare(b))
        .pop()
    );

  if (currentPackageVersion !== undefined) {
    const commitMessage = context.payload.head_commit.message;
    let [major, minor, patch] = currentPackageVersion
      .split(".")
      .map((v) => parseInt(v, 10));
    if (
      commitMessage.includes("BREAKING CHANGE") ||
      commitMessage.includes("!:")
    ) {
      major++;
      minor = 0;
      patch = 0;
    } else if (commitMessage.toLowerCase().startsWith("feat")) {
      minor++;
      patch = 0;
    } else {
      patch++;
    }
    const newPackageVersion = `${major}.${minor}.${patch}`;

    exec.exec(
      `npm version ${newPackageVersion} --no-git-tag-version --allow-same-version`
    );
  }
}

module.exports = { bumpPackageVersion };
