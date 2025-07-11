const pool = require('../config/db');

const CreateRoomModel = async (name, location, capacity, floor, image, description, equipment) => {
  try {
    const result = await pool.query(`INSERT INTO rooms (name, location, capacity, floor, image, description, equipment) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, 
      [name, location, capacity, floor, image, description, equipment]);
    return result; 
  } catch (error) {
    throw error; 
  }
};

const FetchRoomModel = () => {
  return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM rooms',
          (err, result) => {
              if(err) {
                  reject(err);
              }
              else {
                  resolve(result)
              }
          }
      )
  })
}

const UpdateRoomModel = async (name, location, capacity, floor, image, description, equipment, id) => {
  try {
    const query = `
      UPDATE rooms
      SET name=$1, location=$2, capacity=$3, floor=$4, image=$5, description=$6, equipment=$7 
       WHERE id=$8 RETURNING *`;
    
    const values = [name, location, capacity, floor, image, description, equipment, id ];

    const result = await pool.query(query, values);
    return result; // Return the updated row
  } catch (error) {
    throw error;
  }
};

const DeleteRoomModel = (id) => {
  return new Promise((resolve, reject) => {
      pool.query('DELETE FROM rooms WHERE id = $1', [id], (err, result) => {
          if (err) {
              reject(err);
          } else {
              if (result.rowCount === 0) {  // If no rows were deleted
                  resolve({ status: "No matching record found" });
              } else {
                  resolve({ status: `Deleted room ${id}` });
              }
          }
      });
  });
};

module.exports =  {CreateRoomModel, FetchRoomModel, UpdateRoomModel, DeleteRoomModel};





























































// // models/eventModel.js
// const pool = require('../config/db');

// const CreateEventModel = async (name, meeting_name, start_time, end_time, purpose, contact_number, email,  team_category, team_sub_category, other_option) => {
//   try {
//     const result = await pool.query(`INSERT INTO meetings (name, meeting_name, start_time, end_time, purpose, contact_number, email,  team_category, team_sub_category, other_option) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, 
//       [ name, meeting_name, start_time, end_time, purpose, contact_number, email, team_category, team_sub_category, other_option,]);
//     return result; 
//   } catch (error) {
//     throw error; 
//   }
// };

// const FetchEventsModel = () => {
//   return new Promise((resolve, reject) => {
//       pool.query('SELECT * FROM meetings',
//           (err, result) => {
//               if(err) {
//                   reject(err);
//               }
//               else {
//                   resolve(result)
//               }
//           }
//       )
//   })
// }

// const UpdateEventsModel = async (name, meeting_name, start_time, end_time, purpose, contact_number, team_category, team_sub_category, other_option, email) => {
//   try {
//     const query = `
//       UPDATE meetings 
//       SET name=$1, meeting_name=$2, start_time=$3, end_time=$4, purpose=$5, contact_number=$6,  team_category=$7, team_sub_category=$8, other_option=$9 
//       WHERE email=$10 RETURNING *`;
    
//     const values = [name, meeting_name, start_time, end_time, purpose, contact_number, team_category, team_sub_category, other_option, email];

//     const result = await pool.query(query, values);
//     return result; // Return the updated row
//   } catch (error) {
//     throw error;
//   }
// };

// const DeleteEventModel = (id) => {
//   return new Promise((resolve, reject) => {
//       pool.query('DELETE FROM meetings WHERE email = $1', [id], (err, result) => {
//           if (err) {
//               reject(err);
//           } else {
//               if (result.rowCount === 0) {  // If no rows were deleted
//                   resolve({ status: "No matching record found" });
//               } else {
//                   resolve({ status: `Deleted resume ${id}` });
//               }
//           }
//       });
//   });
// };

// module.exports =  {CreateEventModel, FetchEventsModel, UpdateEventsModel, DeleteEventModel} ;
