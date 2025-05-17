export const sites: {
  [key: string]: {
    address: string;
    banner: string;
    links: { href: string; label: string }[];
    cta?: { href: string; label: string };
  };
} = {
  "blog.sigle.io": {
    address: "ST3CH69RQ9FWCHSKMWG7J5TQCNADRDPX43M9AS35Z",
    banner: "/websites/blog.sigle.io/banner.png",
    links: [
      { href: "https://www.sigle.io/", label: "Home" },
      { href: "https://app.sigle.io/explore", label: "Explore" },
    ],
    cta: { href: "https://app.sigle.io/", label: "Get Started" },
  },
};

// Add localhost to sites for development
if (process.env.NODE_ENV === "development") {
  sites["localhost:3000"] = sites["blog.sigle.io"];
  sites["localhost%3A3000"] = sites["blog.sigle.io"];
}
// Preview deployments
else if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
  sites[process.env.VERCEL_URL] = sites["blog.sigle.io"];
  sites[
    `custom-domain-git-${process.env.VERCEL_GIT_COMMIT_REF?.replace(
      "/",
      "-",
    )}-${process.env.VERCEL_GIT_REPO_OWNER}.vercel.app`
  ] = sites["blog.sigle.io"];
}
// E2E tests
else if (process.env.APP_URL === "http://127.0.0.1:3000") {
  sites["127.0.0.1:3000"] = sites["blog.sigle.io"];
}
