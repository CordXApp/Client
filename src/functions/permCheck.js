module.exports.customCommandPermCheck = async function ({ perms, user, conf }) {
  let status;

  if (perms.includes("BOT_ADMIN")) {
    if (conf.includes(user.id)) status = true;
    else status = false;
  }

  return status;
};

module.exports.baseCommandPermCheck = async function ({ perms, user }) {
  let status;

  if (perms && user.has(perms)) status = true;
  else status = false;

  return status;
};
