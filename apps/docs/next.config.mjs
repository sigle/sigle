import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  output: "export",
  images: {
    // mandatory for nextra, otherwise won't export
    unoptimized: true,
  },
});
