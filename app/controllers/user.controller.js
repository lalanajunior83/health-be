const responseFormatter = require("../helpers/responseFormatter");
const getUser = require("../helpers/getUser");
const { user, role, history_disease, disease, allergy, fruit } =  require("../models");

class UserController {
  static getProfile = async (req, res) => {
    try {
      const userJWT = await getUser(req, res)

      const userData = await user.findOne({
        include: [
          {
            model: role,
            attributes:{
              exclude: ["createdAt", "updatedAt"]
            },
          },
          {
            model: history_disease,
            attributes:{
              exclude: ["createdAt", "updatedAt", "disease_id", "user_id"]
            },
            include: [
              {
                model: disease,
                attributes:{
                  exclude: ["createdAt", "updatedAt"]
                },
              }
            ]
          },
          {
            model: allergy,
            attributes: {
              exclude: ["createdAt", "updatedAt", "user_id", "fruit_id"]
            },
            include: [
              {
                model: fruit,
                attributes:{
                  exclude: ["createdAt", "updatedAt", "user_id"]
                },
              }
            ]
          }
        ],
        attributes: {
          exclude: ["password", "is_active", "role_id"]
        },
        where: {
          user_id: userJWT.user_id
        }
      })

      if(!userData) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data pengguna tidak detemukan", res.statusCode)
          );
      }

      return res
        .status(200)
        .json(
          responseFormatter.success(
            userData,
            "Data pengguna berhasil ditampilkan",
            res.statusCode
          )
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static diseaseUser = async (req, res) => {
    try {
      const diseases = req.body;
      const userData = await getUser(req, res)

      const historyExist =  await checkHistoryDisease(userData)
      if(historyExist) {
        history_disease.destroy({
          where:{
            user_id: userData.user_id
          }
        })
      }

      const mapDiseaseUser = diseases.map(
        (disease_id) => ({
          disease_id,
          user_id: userData.user_id,
        })
      );

      const retriviedHistoryDisease = await history_disease.bulkCreate(mapDiseaseUser);
      if(retriviedHistoryDisease) {
        const response = await history_disease.findAll({
          where: {
            user_id: userData.user_id
          },
          include: [
            {
              model: disease,
              attributes: {
                exclude: ["createdAt", "updatedAt"]
              } 
            }
          ],
          attributes: ["history_disease_id"]
        })

        return res
          .status(200)
          .json(
            responseFormatter.success(
              response,
              "Data riwayat penyakit berhasil diubah",
              res.statusCode
            )
          );
      }

      throw new Error();

    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static allergyUser = async (req, res) => {
    try {
      const allergies = req.body;
      const userData = await getUser(req, res)
      
      const allergyExist =  await checkAllergy(userData)
      if(allergyExist) {
        allergy.destroy({
          where:{
            user_id: userData.user_id
          }
        })
      }

      const mapAllergyUser = allergies.map(
        (fruit_id) => ({
          fruit_id,
          user_id: userData.user_id,
        })
      );

      const retriviedAllergy = await allergy.bulkCreate(mapAllergyUser);
      
      if(retriviedAllergy) {
        const response = await allergy.findAll({
          where: {
            user_id: userData.user_id
          },
          include: [
            {
              model: fruit,
              attributes: {
                exclude: ["createdAt", "updatedAt"]
              } 
            }
          ],
          attributes: ["allergy_id"]
        })

        return res
          .status(200)
          .json(
            responseFormatter.success(
              response,
              "Data alergi berhasil diubah",
              res.statusCode
            )
          );
      }

      throw new Error()

    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

async function checkHistoryDisease(userData) {
  return new Promise(async (resolve) => {
    try {
      const findExistingHistoryDisease = await history_disease.findOne({
        where: {
          user_id: userData.user_id
        }
      });

      if (findExistingHistoryDisease) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      resolve(false);
    }
  });
}

async function checkAllergy(userData) {
  return new Promise(async (resolve) => {
    try {
      const findExistingAllergy = await allergy.findOne({
        where: {
          user_id: userData.user_id
        }
      });

      if (findExistingAllergy) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      resolve(false);
    }
  });
}
module.exports = UserController