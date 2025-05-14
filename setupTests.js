if (!process.__HAS_UNHANDLED_REJECTION_LISTENER__) {
  process.on("unhandledRejection", (err) => {
    throw err;
  });
  process.__HAS_UNHANDLED_REJECTION_LISTENER__ = true;
}
