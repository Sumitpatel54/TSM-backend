/* eslint-disable no-multi-spaces */
/* eslint-disable no-empty */
/* eslint-disable semi */
/* eslint-disable no-trailing-spaces */
import { Request, Response } from "express"
import HttpStatusCode from "http-status-codes"
import mongoose from "mongoose"

import QuestionnaireService from "../services/questionnaire.service"
import UserService from "../services/user.service"
import commonUtilitie from "../utilities/common"
import { addJobSendMailQuestionLinkCreation } from "../configurations/bullMq"
import constants from "../utilities/directoryPath"
import Questionnaire from "../models/questionnaire.model"
import userController from "./user.controller"
// const apiCreateQuestionnaire = async (req: Request, res: Response) => {
//   try {
//     let payload: any = req.body ? req.body : undefined
//     if (payload === undefined) {
//       return res.status(HttpStatusCode.BAD_REQUEST).send({
//         status: false,
//         message: "Invalid Payload",
//       })
//     }

//     const file: any = req.files?.image

//     if (file) {
//       const image = await commonUtilitie.getUploadURL(file)
//       payload["imageUrl"] = image
//     }

//     if (payload.queryBlock) {
//       payload.queryBlock = JSON.parse(payload.queryBlock)
//     }

//     if (payload.options) {
//       payload.options = JSON.parse(payload.options)
//     }

//     const createQuestionnaireResponse =
//       await QuestionnaireService.createQuestionnaire(payload)
//     return res.status(200).send({
//       status: true,
//       data: createQuestionnaireResponse,
//       message: "Questionnaire Record Created",
//     })
//   } catch (error: any) {
//     return res.status(404).send({
//       status: false,
//       message: error.message,
//     })
//   }
// }

const apiCreateQuestionnaire = async (req: Request, res: Response) => {
  try {
    let payload: any = req.body ? req.body : undefined;
    if (!payload) {
      return res.status(HttpStatusCode.BAD_REQUEST).send({
        status: false,
        message: "Invalid Payload",
      })
    }

    const files: any[] = Object.values(req.files || {});
    if (files.length > 0) {
      const imageUrlsArray = await Promise.all(files.map(file => commonUtilitie.getUploadURLWithDir(file, constants.QUESTIONNAIRE_IMAGES)));
      const imageUrls = imageUrlsArray.flat(); // Flatten the array

      payload.imageUrl = imageUrls; // Ensure this is properly set
    }

    if (payload.queryBlock) {
      payload.queryBlock = JSON.parse(payload.queryBlock)
    }

    if (payload.options) {
      payload.options = JSON.parse(payload.options)
    }

    const createQuestionnaireResponse =
      await QuestionnaireService.createQuestionnaire(payload)
    return res.status(200).send({
      status: true,
      data: createQuestionnaireResponse,
      message: "Questionnaire Record Created",
    })
  } catch (error: any) {
    return res.status(404).send({
      status: false,
      message: error.message,
    })
  }
}

const apiRetrieveQuestionnaire = async (req: Request, res: Response) => {
  try {
    const questionnaireCategoryId: any = req.params.id?.toString()
    const retrieveQuestionnaireResponse =
      await QuestionnaireService.retrieveQuestionnaire({
        _id: new mongoose.Types.ObjectId(questionnaireCategoryId),
      })
    if (retrieveQuestionnaireResponse !== null) {
      return res.status(200).send({
        status: true,
        data: retrieveQuestionnaireResponse,
        message: "Questionnaire Record Fetched",
      })
    }
    return res.status(404).send({
      status: false,
      message: "No record found",
    })
  } catch (error: any) {
    return res.status(404).send({
      status: false,
      message: error.message,
    })
  }
}

const apiListQuestionnaires = async (req: Request, res: Response) => {
  try {
    const pageNo: any = Number(req.query.pageNo)
    const perPage: any = Number(req.query.perPage)
    const queryParams = { pageNo, perPage }
    const listQuestionnairesResponse: any =
      await QuestionnaireService.listQuestionnaires(queryParams)
    if (listQuestionnairesResponse !== null) {
      let totalData = listQuestionnairesResponse[0].totalCount[0]
        ? listQuestionnairesResponse[0].totalCount[0].count
        : 1
      let totalPages = commonUtilitie.getTotalPages(totalData, perPage)
      return res.status(200).send({
        status: true,
        data: listQuestionnairesResponse[0].paginatedResults,
        totalPages: totalPages,
      })
    }
    return res.status(404).send({
      status: false,
      message: "No record found",
    })
  } catch (error: any) {
    return res.status(404).send({
      status: false,
      message: error.message,
    })
  }
}

const searchQuestionnaires = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    const pageNo: any = Number(req.query.pageNo) || 1
    const perPage: any = Number(req.query.perPage) || 10
    const categoryType: any = req.query.categoryType
    const searchString: any = req.query.searchString
    const sortField: any = req.query.sortField
    let sortOrder: any = req.query.sortOrder || "asc"

    // manage sort order
    if (sortOrder === "asc") sortOrder = 1
    else sortOrder = -1

    const payload: any = {}
    const project: any = {}
    const match: any = {}
    const sort: any = {}
    const arr: any = []
    const options = { page: pageNo, limit: perPage }

    // manage searh filters
    const obj: any = {}
    if (categoryType) {
      obj.categoryType = categoryType
      match["$match"] = obj
    }

    if (searchString) {
      payload["$match"] = { $text: { $search: `${searchString}`.trim() } }
    } else {
      payload["$match"] = obj
    }

    // determine what fields to generate
    project["$project"] = {
      sectionName: 1,
      questionNumber: 1,
      questionType: 1,
      title: 1,
      options: 1,
      imageRequired: 1,
      imageUrl: 1,
      previousQuestion: 1,
      selectedExercise: 1,
    }

    // manage sorting
    if (sortField) sort["$sort"] = { [sortField]: sortOrder }

    arr.push(payload)
    arr.push(project)
    if (Object.keys(match).length > 0) arr.push(match)
    if (Object.keys(sort).length > 0) arr.push(sort)

    const searchResponse: any =
      await QuestionnaireService.retrieveQuestionnaireWithPaginateAggregate(
        arr,
        options
      )
    return res.status(200).send({
      status: true,
      data: searchResponse.docs,
      totalPages: searchResponse.totalPages,
      totalQuestions: searchResponse.totalDocs,
      message: "Questionnaire Records retrieved",
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message,
    })
  }
}

const apiListAllQuestionnaires = async (req: Request, res: Response) => {
  try {
    let result: any = await QuestionnaireService.listAllQuestionnaires({})

    if (Array.isArray(result) && result.length > 0) {
      result = result.map((obj) => ({ _id: obj._id, title: obj.title }))
    }

    return res.status(200).send({
      status: true,
      data: result,
    })
  } catch (error: any) {
    return res.status(404).send({
      status: false,
      message: error.message,
    })
  }
}

const apiUpdateQuestionnaire = async (req: Request, res: Response) => {
  try {
    let payload: any = req.body
    const questionnaireId: any = req.params.id

    const files: any[] = Object.values(req.files || {});
    if (files.length > 0) {
      const imageUrlsArray = await Promise.all(files.map(file => commonUtilitie.getUploadURLWithDir(file, constants.QUESTIONNAIRE_IMAGES)));
      const imageUrls = imageUrlsArray.flat(); // Flatten the array

      payload.imageUrl = imageUrls; // Ensure this is properly set
    }
    // if (file) {
    //   const image = await commonUtilitie.getUploadURL(file)
    //   payload["imageUrl"] = image
    // }

    if (payload.queryBlock) {
      payload.queryBlock = JSON.parse(payload.queryBlock)
    }

    if (payload.options) {
      payload.options = JSON.parse(payload.options)
    }

    const updateQuestionnaireResponse =
      await QuestionnaireService.updateQuestionnaire(questionnaireId, payload)
    return res.status(200).send({
      status: true,
      data: updateQuestionnaireResponse,
      message: "Questionnaire Record Updated",
    })
  } catch (error: any) {
    return res.status(404).send({
      status: false,
      message: error.message,
    })
  }
}

const apiDeleteQuestionnaire = async (req: Request, res: Response) => {
  try {
    const questionnaireId: any = req.params.id
    const deleteQuestionnaireResponse =
      await QuestionnaireService.deleteQuestionnaire(questionnaireId)
    return res.status(200).send({
      status: true,
      data: deleteQuestionnaireResponse,
      message: "Questionnaire Record Deleted",
    })
  } catch (error: any) {
    return res.status(404).send({
      status: false,
      message: error.message,
    })
  }
}

const apiGetFirstQuestion = async (req: Request, res: Response) => {
  const statusCode = 500;

  try {
    const userId: any = req.user?.id;
    let user: any = await UserService.findUser({ _id: userId });

    if (user) {
      user = user.toObject();
    }

    // Get the total questionnaire count
    const totalQuestionnaireCount = await Questionnaire.countDocuments();

    // Get the user's questionnaire answers
    const questionnaireAnswers: any = user.questionnaireAnswers;

    // Check if the questionnaire is already completed from previous sessions
    // This is determined by checking if the user has answers and if there are no more questions
    const isQuestionnaireDone = (user as any).isQuestionnaireDone ||
      (questionnaireAnswers &&
        Object.keys(questionnaireAnswers).length > 0 &&
        Object.keys(questionnaireAnswers).length >= totalQuestionnaireCount);

    // If questionnaire is already done, return this info immediately
    if (isQuestionnaireDone) {
      return res.status(200).send({
        status: true,
        data: null,
        totalQuestions: totalQuestionnaireCount,
        message: "Questionnaire already completed",
        isQuestionnaireDone: true
      });
    }

    if (!questionnaireAnswers || Object.keys(questionnaireAnswers).length === 0) {
      // If no answers, fetch the first question
      const retrieveQuestionnaireResponse = await QuestionnaireService.listAllQuestionnairesSortedByCreatedAt({});
      if (retrieveQuestionnaireResponse !== null) {
        return res.status(200).send({
          status: true,
          data: retrieveQuestionnaireResponse,
          totalQuestions: totalQuestionnaireCount,
          message: "Questionnaire Record Fetched",
          isQuestionnaireDone: false
        });
      }
      return res.status(statusCode).send({
        status: false,
        message: "No record found",
      });
    } else {
      // Find the last answered question
      const answeredQuestionKeys = Object.keys(questionnaireAnswers);
      const lastAnsweredQuestionKey = answeredQuestionKeys[answeredQuestionKeys.length - 1];
      const lastAnsweredQuestion = questionnaireAnswers[lastAnsweredQuestionKey];

      // Determine the selected option and corresponding next question
      const selectedOption = lastAnsweredQuestion.answer;
      const nextQuestionBlock = lastAnsweredQuestion.questionnaire.queryBlock.find(
        (block: any) => block.selectedOption === selectedOption
      );

      if (!nextQuestionBlock) {
        return res.status(404).send({
          status: false,
          message: "No matching next question found for the selected option",
        });
      }

      const nextQuestionId = nextQuestionBlock.nextQuestion;

      if (nextQuestionId) {
        const nextQuestionData = await Questionnaire.findById(nextQuestionId).lean();

        if (nextQuestionData) {
          return res.status(200).send({
            status: true,
            data: nextQuestionData,
            totalQuestions: totalQuestionnaireCount,
            message: "Next question fetched",
            isQuestionnaireDone: false
          });
        } else {
          // No more questions found, mark questionnaire as done
          await UserService.updateUser(userId, { $set: { isQuestionnaireDone: true } });
          return res.status(200).send({
            status: true,
            data: null,
            totalQuestions: totalQuestionnaireCount,
            message: "No more questions",
            isQuestionnaireDone: true
          });
        }
      } else {
        // No next question defined, mark questionnaire as done
        await UserService.updateUser(userId, { $set: { isQuestionnaireDone: true } });
        return res.status(200).send({
          status: true,
          data: null,
          totalQuestions: totalQuestionnaireCount,
          message: "No more questions",
          isQuestionnaireDone: true
        });
      }
    }
  } catch (error: any) {
    return res.status(404).send({
      status: false,
      message: error.message,
    });
  }
};


/**
 * @summary - Submit's a user's answer to a question in a questionnaire
 * @param req
 * @param res
 * @returns
 */
const apiProvideAnswers = async (req: Request, res: Response) => {
  let statusCode = 500
  let obj: any
  let image: any = ""
  let answerObj: any = {}
  let questionNo: any

  try {
    const questionnaireId: any = req.params.questionId
    const userId: any = req.user?.id
    const answer: any = req.body.answer?.trim()
    const file: any = req.files?.image

    if (!file && !answer) {
      statusCode = 400
      throw new Error("Kindly provide an answer.")
    }

    // Start multiple operations in parallel where possible
    const fileUploadPromise = file ? commonUtilitie.getUploadURL(file) : Promise.resolve("");

    // Get questionnaire
    const retrieveQuestionnairePromise = QuestionnaireService.retrieveQuestionnaire({
      _id: new mongoose.Types.ObjectId(questionnaireId),
    });

    // Wait for both operations to complete
    const [uploadedImage, retrieveQuestionnaireResponse] = await Promise.all([
      fileUploadPromise,
      retrieveQuestionnairePromise
    ]);

    image = uploadedImage;

    if (!retrieveQuestionnaireResponse) {
      throw new Error("Questionnaire not found");
    }

    const questionnaireData = retrieveQuestionnaireResponse.toObject();

    // Cache the question number for the questionnaire
    questionNo = Number(questionnaireData.questionNumber);
    // Cache query block
    const queryBlock = questionnaireData.queryBlock;

    // Prepare the answer object early to avoid redundant operations
    answerObj = {
      questionnaire: questionnaireData,
      answer: answer || "",
      image: image || ""
    };

    // Find the matching query block option
    let nextQuestionId = null;
    if (Array.isArray(queryBlock) && queryBlock.length > 0) {
      const lowerCaseAnswer = answer.toLowerCase();
      obj = queryBlock.find(
        (v: any) => v.selectedOption?.toLowerCase() === lowerCaseAnswer
      );

      if (!obj)
        throw new Error(`'queryBlock' does not have the answer: ${answer}`);

      // Store next question ID for later use
      nextQuestionId = obj.nextQuestion;

      // Update operations to run in parallel
      const updateOperations = [];

      // If a report block is provided, prepare update operation
      if (obj.reportBlock) {
        const reportBlock = {
          title: questionnaireData.sectionName,
          text: obj.reportBlock,
          image: questionnaireData.imageUrl,
        };

        updateOperations.push(
          UserService.updateUser(userId, {
            $set: {
              [`reportBlock.${questionnaireId}`]: reportBlock,
              [`questionnaireAnswers.${questionnaireId}`]: answerObj
            }
          })
        );
      } else {
        // Just update the answer
        updateOperations.push(
          UserService.updateUser(userId, {
            $set: { [`questionnaireAnswers.${questionnaireId}`]: answerObj }
          })
        );
      }

      // Execute all updates in parallel
      await Promise.all(updateOperations);
    } else {
      // Add provided answer to user
      await UserService.updateUser(userId, {
        $set: { [`questionnaireAnswers.${questionnaireId}`]: answerObj }
      });
    }

    // Prepare next question response before starting heavy background tasks
    let nextQuestionResponse: any = null;

    // If we have a direct next question from the query block
    if (nextQuestionId) {
      const retrieveNextQuestionnaireResponse = await QuestionnaireService.retrieveQuestionnaire({
        _id: new mongoose.Types.ObjectId(nextQuestionId),
      });

      if (retrieveNextQuestionnaireResponse) {
        nextQuestionResponse = {
          status: true,
          data: {
            nextQuestion: retrieveNextQuestionnaireResponse,
          },
          message: "Questionnaire Record Fetched",
        };
      }
    }

    // If no direct next question, try to find by question number
    if (!nextQuestionResponse) {
      try {
        const retrieveNextQuestionnaireResponse = await QuestionnaireService.retrieveNextQuestionnaire({
          questionNumber: { $gt: questionNo },
        });

        if (Array.isArray(retrieveNextQuestionnaireResponse) && retrieveNextQuestionnaireResponse.length > 0) {
          nextQuestionResponse = {
            status: true,
            data: {
              nextQuestion: retrieveNextQuestionnaireResponse[0],
            },
            message: "Questionnaire Record Fetched",
          };
        }
      } catch (e: any) {
        // If we can't find next question, we'll mark as done below
      }
    }

    // Start heavy background tasks without waiting for them
    // These operations will continue running after the response is sent
    setTimeout(async () => {
      try {
        // Run these operations in the background without blocking the response
        const user = await UserService.findUser({ _id: userId });
        if (user) {
          userController.updateUserBMIData(user).catch(error => {
            console.warn("Failed to update user BMI data:", error.message);
          });
        }

        // Run program generation - only call programGeneration since it already calls generateProgramForUser internally
        QuestionnaireService.programGeneration(userId).catch(e => {
          console.log("Error in program generation:", e);
        });

        // If no more questions found, mark questionnaire as done
        if (!nextQuestionResponse) {
          await UserService.updateUser(userId, { $set: { isQuestionnaireDone: true } });
        }
      } catch (error) {
        console.error("Error in background tasks:", error);
      }
    }, 0);

    // Return next question if found
    if (nextQuestionResponse) {
      return res.status(200).send(nextQuestionResponse);
    }

    // No more questions
    return res.status(200).send({
      status: true,
      message: "Success",
      isQuestionnaireDone: true
    });
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message,
    });
  }
}

/**
 * @summary - after 30 and 60 days Submit's a user's answer to a question in a questionnaire
 * @param req
 * @param res
 * @returns
 */
const apiProgressProvideAnswers = async (
  req: Request,
  res: Response
) => {
  let statusCode = 500
  let obj: any
  let image: any = ""
  let answerObj: any = {}
  let questionNo: any = 0

  try {

    const questionnaireId: any = req.body.questionId
    const userId: any = req.user?.id
    const answer: any = req.body.answer?.trim()
    const file: any = req.files?.image
    const days = Number(req.body.days)

    addJobSendMailQuestionLinkCreation({ email: req.user?.email, userId: userId, userName: `${req.user?.firstName}  ${req.user?.lastName}` }, userId)


    if (!file && !answer && questionnaireId) {
      statusCode = 400
      throw new Error("Kindly provide an answer.")
    }
    if (!days || days !== 30 && days !== 60 && days !== 90) {
      statusCode = 400
      throw new Error("Kindly provide an days.")
    }

    if (file) {
      image = await commonUtilitie.getUploadURL(file)
    }
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - (days))
    const formatDate = (sevenDaysAgo: any) => {
      return sevenDaysAgo.toISOString().split('T')[0]
    }

    let userQuery = { _id: new mongoose.Types.ObjectId(userId), exerciseStartDate: { $lt: formatDate(sevenDaysAgo) } }
    let userDetails = await UserService.findUser(userQuery)

    if (!userDetails) {
      statusCode = 400
      throw new Error("Sorry, we were unable to start this process. Please try again later or contact our support team for assistance.")
    } else if ((userDetails.bmiAfter30Data && days === 30) || (userDetails.bmiAfter60Data && days === 60) || (userDetails.bmiAfter90Data && days === 90)) {
      statusCode = 400
      throw new Error("Oops! It appears you've already completed this process.")
    }

    if (questionnaireId) {
      // get questionnaire
      let retrieveQuestionnaireResponse: any =
        await QuestionnaireService.retrieveQuestionnaire({
          _id: new mongoose.Types.ObjectId(questionnaireId),
        })
      if (retrieveQuestionnaireResponse)
        retrieveQuestionnaireResponse = retrieveQuestionnaireResponse.toObject()

      // cache the question number for the questionnaire
      questionNo = Number(retrieveQuestionnaireResponse.questionNumber)
      // cache query block
      const queryBlock = retrieveQuestionnaireResponse.queryBlock

      // get the next question
      if (Array.isArray(queryBlock) && queryBlock.length > 0) {
        obj = queryBlock.find(
          (v: any) => v.selectedOption?.toLowerCase() === answer.toLowerCase()
        )

        if (!obj)
          throw new Error(`'queryBlock' does not have the answer: ${answer}`)

        // if a report block is provided save the report in the user's document
        if (obj.reportBlock) {
          const reportBlock = {
            title: retrieveQuestionnaireResponse.sectionName,
            text: obj.reportBlock,
            image: retrieveQuestionnaireResponse.imageUrl,
          }

          await UserService.updateUser(userId, {
            $set: { [`reportBlockAfter${days}Days.${questionnaireId}`]: reportBlock },
          })
        }
      }

      // format answer object
      answerObj["questionnaire"] = retrieveQuestionnaireResponse
      answerObj["answer"] = answer || ""
      answerObj["image"] = image || ""

      // add provided answer to user
      await UserService.updateUser(userId, {
        $set: { [`questionnaireAnswersAfter${days}Days.${questionnaireId}`]: answerObj },
      })

      if (obj && obj.nextQuestion) {
        // get next questionnaire
        const retrieveNextQuestionnaireResponse: any =
          await QuestionnaireService.retrieveQuestionnaire({
            _id: new mongoose.Types.ObjectId(obj.nextQuestion),
          })

        return res.status(200).send({
          status: true,
          data: {
            nextQuestion: retrieveNextQuestionnaireResponse,
          },
          message: "Questionnaire Record Fetched",
        })
      }
    }

    try {
      // get next question by question number
      const retrieveNextQuestionnaireResponse: any =
        await QuestionnaireService.retrieveNextQuestionnaire({
          questionNumber: { $gt: questionNo },
        })

      if (
        Array.isArray(retrieveNextQuestionnaireResponse) &&
        retrieveNextQuestionnaireResponse.length > 0
      ) {
        return res.status(200).send({
          status: true,
          data: {
            nextQuestion: retrieveNextQuestionnaireResponse[0],
          },
          message: "Questionnaire Record Fetched",
        })
      }
    } catch (e: any) {
      return res.status(500).send({
        status: false,
        message: "Something went wrong.",
      })
    }

    // No more questions, mark the follow-up questionnaire as done
    const updateField = days === 30 ? 'isQuestionnaire30DaysDone' :
      days === 60 ? 'isQuestionnaire60DaysDone' :
        'isQuestionnaire90DaysDone';

    await UserService.updateUser(userId, { $set: { [updateField]: true } });

    return res.status(200).send({
      status: true,
      message: "Success",
      isQuestionnaireDone: true
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message,
    })
  }
}

const apiGenerateTemplate = async (req: Request, res: Response) => {
  // create program for user
  try {
    const userId: any = req.params?.id
    await QuestionnaireService.generateProgramForUser(userId)
    // await QuestionnaireService.generatePosturalProgramForUser(userId)
    return res.status(200).send(true)
  } catch (e: any) {
    return res.status(500).send({
      status: false,
      message: "Failed to create exercise program: " + e.message,
    })
  }
}

const apiGenerateReportBlock = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    const userId: any = req.user?.id
    let user: any = await UserService.findUser({ _id: userId })

    if (!user) {
      statusCode = 400
      throw new Error("Cannot find user")
    }

    user = user.toObject()

    // cache report block
    let reportBlock = user.reportBlock

    if (Number(req.query.days) === 30) {
      reportBlock = user.reportBlockAfter30Days
    } else if (Number(req.query.days) === 60) {
      reportBlock = user.reportBlockAfter60Days
    }

    if (
      !reportBlock ||
      (reportBlock && Object.values(reportBlock).length === 0)
    ) {
      return res.status(200).send({
        status: true,
        data: {
          reports: null,
        },
        message: "User has no report",
      })
    }

    return res.status(200).send({
      status: true,
      data: {
        reports: reportBlock ? Object.values(reportBlock) : reportBlock,
        user,
      },
      message: "User report block fetched",
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message,
    })
  }
}

const apiGetOnboardingProgress = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;

    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).send({
        status: false,
        message: "Unauthorized access",
      });
    }

    const user = await UserService.findUser({ _id: new mongoose.Types.ObjectId(userId) });

    if (!user) {
      return res.status(HttpStatusCode.NOT_FOUND).send({
        status: false,
        message: "User not found",
      });
    }

    const totalQuestions = await QuestionnaireService.getTotalQuestionCount();
    const answeredQuestions = Object.keys(user.questionnaireAnswers || {}).length;
    const progress = (answeredQuestions / totalQuestions) * 100;

    return res.status(HttpStatusCode.OK).send({
      status: true,
      data: {
        currentQuestionIndex: answeredQuestions,
        totalQuestions: totalQuestions,
        progress: Math.round(progress),
        completedSections: user.completedSections || 0,
      },
      message: "Onboarding progress fetched successfully",
    });
  } catch (error: any) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
      status: false,
      message: error.message,
    });
  }
};

const apiUpdateOnboardingProgress = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;
    const { currentQuestionIndex, completedSections } = req.body;

    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).send({
        status: false,
        message: "Unauthorized access",
      });
    }

    if (typeof currentQuestionIndex !== 'number' || typeof completedSections !== 'number') {
      return res.status(HttpStatusCode.BAD_REQUEST).send({
        status: false,
        message: "Invalid input data",
      });
    }

    const updatedUser = await UserService.updateUser(userId, {
      $set: {
        currentQuestionIndex: currentQuestionIndex,
        completedSections: completedSections,
      }
    });

    if (!updatedUser) {
      return res.status(HttpStatusCode.NOT_FOUND).send({
        status: false,
        message: "User not found",
      });
    }

    const totalQuestions = await QuestionnaireService.getTotalQuestionCount();
    const progress = (currentQuestionIndex / totalQuestions) * 100;

    return res.status(HttpStatusCode.OK).send({
      status: true,
      data: {
        currentQuestionIndex: currentQuestionIndex,
        totalQuestions: totalQuestions,
        progress: Math.round(progress),
        completedSections: completedSections,
      },
      message: "Onboarding progress updated successfully",
    });
  } catch (error: any) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
      status: false,
      message: error.message,
    });
  }
};

const apiCheckQuestionnaireStatus = async (req: Request, res: Response) => {
  try {
    const userId: any = req.user?.id;

    if (!userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).send({
        status: false,
        message: "Unauthorized access",
      });
    }

    const user = await UserService.findUser({ _id: new mongoose.Types.ObjectId(userId) });

    if (!user) {
      return res.status(HttpStatusCode.NOT_FOUND).send({
        status: false,
        message: "User not found",
      });
    }

    // Check if questionnaire is completed
    const totalQuestionnaireCount = await Questionnaire.countDocuments();
    const questionnaireAnswers = user.questionnaireAnswers || {};
    const answeredQuestionsCount = Object.keys(questionnaireAnswers).length;

    // Consider questionnaire done if explicitly marked as done or if all questions are answered
    // Use optional chaining to safely access the property that might not be in the type definition
    const isQuestionnaireDone = (user as any).isQuestionnaireDone ||
      (answeredQuestionsCount > 0 && answeredQuestionsCount >= totalQuestionnaireCount);

    return res.status(HttpStatusCode.OK).send({
      status: true,
      data: {
        isQuestionnaireDone: isQuestionnaireDone,
        answeredQuestions: answeredQuestionsCount,
        totalQuestions: totalQuestionnaireCount,
      },
      message: "Questionnaire status retrieved successfully",
    });
  } catch (error: any) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
      status: false,
      message: error.message,
    });
  }
};

export default {
  apiCreateQuestionnaire,
  apiRetrieveQuestionnaire,
  apiUpdateQuestionnaire,
  apiListQuestionnaires,
  apiDeleteQuestionnaire,
  apiListAllQuestionnaires,
  apiProvideAnswers,
  apiProgressProvideAnswers,
  apiGetFirstQuestion,
  searchQuestionnaires,
  apiGenerateReportBlock,
  apiGenerateTemplate,
  apiGetOnboardingProgress,
  apiUpdateOnboardingProgress,
  apiCheckQuestionnaireStatus,
}
