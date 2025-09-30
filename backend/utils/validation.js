const db = require('../db/db');

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;


const mobileRegex = /^[6-9]\d{9}$/;

async function validateUserDetails({ full_name, mobile_no, pan_num, manager_id }) {

  if (!full_name || !mobile_no || !pan_num || !manager_id) {
    throw new Error('All fields (full_name, mobile_no, pan_num, manager_id) are required.');
  }
  if (!panRegex.test(pan_num)) {
    throw new Error('Invalid PAN number format.');
  }
  let normalizedMobile = mobile_no.replace(/^(\+91|0)/, '');
  if (!mobileRegex.test(normalizedMobile)) {
    throw new Error('Invalid mobile number format.');
  }
  const managerExists = await new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM managers WHERE id = ? AND is_active = 1';
    db.get(sql, [manager_id], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
  if (!managerExists) {
    throw new Error('Manager does not exist or is not active.');
  }
  return {
    full_name,
    mobile_no: normalizedMobile,
    pan_num,
    manager_id
  };
}

module.exports = { validateUserDetails };
