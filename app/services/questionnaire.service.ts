/* eslint-disable no-multi-spaces */
/* eslint-disable semi */
/* eslint-disable no-trailing-spaces */
/* eslint-disable eol-last */
import { Document, FilterQuery, UpdateQuery } from "mongoose"

import { QuestionnaireDocument } from "../interfaces/questionnaire.interface"
// import Exercise from "../models/exercise.model"
import ExerciseList from "../models/exerciseList.model"
import Program from "../models/program.model"
import ProgramForPosturalExercise from "../models/programForPosturalExercise.model"
import Questionnaire from "../models/questionnaire.model"
import User from "../models/user.model"
import exerciseModel from "../models/exercise.model"
import exerciseListModel from "../models/exerciseList.model"


/**
 * Used to create Questionnaire record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createQuestionnaire = async (payload: Document<QuestionnaireDocument>) => {
  try {
    const questionnaire = await Questionnaire.create(payload)
    if (questionnaire) {
      return questionnaire
    }
    throw new Error(`Sorry some errors occurred while creating Questionnaire`)
  } catch (error: any) {
    throw new Error(error)
  }
}



/**
 * Used to find microcategory by providing filter query
 * @param query
 * @returns QuestionnaireDocument | null
 */
const retrieveQuestionnaire = async (query: FilterQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | null> => {
  try {
    const questionnaire: any = await Questionnaire.findOne(query).exec()
    if (questionnaire) {
      return questionnaire
    }
    else if (questionnaire === null) {
      return null
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaire`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Used to find next question by providing filter query
 * @param query
 * @returns QuestionnaireDocument | null
 */
const retrieveNextQuestionnaire = async (query: FilterQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | null> => {
  try {
    const questionnaire: any = await Questionnaire.find(query).sort({ questionNumber: 1 }).limit(1)
    if (questionnaire) {
      return questionnaire
    }
    else if (questionnaire === null) {
      return null
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaire`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

const retrieveQuestionnairesWithPaginate = async (query: FilterQuery<QuestionnaireDocument>, options: any): Promise<QuestionnaireDocument | null> => {
  try {
    const questionnaires: any = await Questionnaire.paginate(query, options)
    if (questionnaires) {
      return questionnaires
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaires`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * @summary - We use the mongoose aggregate plugin to create pipelines
 * @param query
 * @param options
 * @returns
 */
const retrieveQuestionnaireWithPaginateAggregate = async (query: any, options: any): Promise<any | null> => {
  try {
    const myAggregate = Questionnaire.aggregate(query)
    // @ts-expect-error
    const response: any = await Questionnaire.aggregatePaginate(myAggregate, options)
    if (response) {
      return response
    }
    throw new Error(`Sorry some errors occurred while retriving questionnaire`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Used to find user by providing filter query
 * @param query
 * @returns QuestionnaireDocument | null
 */
const listQuestionnaires = async (query: FilterQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | undefined> => {
  try {
    let questionnaireFacet = {
      $facet: {
        paginatedResults: [{ $skip: query.perPage * (query.pageNo - 1) }, { $limit: Number(query.perPage) }],
        totalCount: [{ $count: 'count' }]
      }
    }
    const listQuestionnairesByPaginationResponse: any = await Questionnaire.aggregate([questionnaireFacet])

    if (listQuestionnairesByPaginationResponse) {
      return listQuestionnairesByPaginationResponse
    }
    throw new Error(`listQuestionnaires details not found`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Provides all questionnaires
 * @param query
 * @returns QuestionnaireDocument | null
 */
const listAllQuestionnaires = async (query: FilterQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | undefined> => {
  try {
    const questionnaires: any = await Questionnaire.find(query ? query : {})
    if (questionnaires) {
      return questionnaires
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaires`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Provides all questionnaires sorted by created at
 * @param query
 * @returns QuestionnaireDocument | null
 */
const listAllQuestionnairesSortedByCreatedAt = async (query: FilterQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | undefined> => {
  try {
    const questionnaires: any = await Questionnaire.find(query ? query : {}).sort({ createdAt: 1 }).exec()
    if (Array.isArray(questionnaires) && questionnaires.length > 0) {
      return questionnaires[0]
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaires`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}


/**
 * Used to update questionnaire details by userId
 *
 * @param categoryId
 * @param payload
 * @returns QuestionnaireDocument | null
 */
const updateQuestionnaire = async (questionnaireId: string, payload: UpdateQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | null> => {
  try {
    const questionnaire: any = await Questionnaire.findByIdAndUpdate(questionnaireId, payload, { new: true })
    if (questionnaire) {
      return questionnaire
    }
    throw new Error(`Questionnaire details not found`)
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Used to delete questionnaire record from DB
 * @param categoryId
 * @returns
 */
const deleteQuestionnaire = async (questionnaireId: string) => {
  try {
    const questionnaire = await Questionnaire.findByIdAndDelete(questionnaireId)
    return questionnaire
  } catch (error: any) {
    throw new Error(error)
  }
}

const getExercise = async (id: any) => {
  let result: any = await ExerciseList.findOne({ "_id": id }).exec()

  if (!result) {
    throw new Error("Exercise not found")
  }

  result = result.toObject()

  return result ? { ...result, isComplete: false } : null
}

const getAllPosturalExercise = async (exerciseCount?: any) => {
  let exerciseList: any = await ExerciseList.find({ exerciseParentName: { $regex: /Postural/, $options: 'i' } }).limit(exerciseCount)

  for (let jr of exerciseList) {
    if (jr && jr.toObject) {
      jr = jr.toObject()
      jr.isComplete = false
    }
  }
  exerciseList = exerciseList.map((t: any) => ({ ...t?.toObject(), isComplete: false }))
  return [...exerciseList]
}


const getAllGeneralExercises = async (exerciseCount?: any) => {
  let exerciseList: any = await ExerciseList.find({ exerciseParentName: { $regex: /General/, $options: 'i' } }).limit(exerciseCount);

  // Parse the day strings to integers
  exerciseList.forEach((exercise: any) => {
    exercise.day = exercise.day.map((day: any) => parseInt(day));
  });

  // Sort the exercises day-wise
  exerciseList.sort((a: any, b: any) => {
    const dayA = a.day[0];
    const dayB = b.day[0];
    return dayA - dayB;
  });

  // Add isComplete property
  exerciseList.forEach((exercise: any) => {
    exercise.isComplete = false;
  });

  return exerciseList;
};



const generateTemplatesArray = (exerciseList: any) => {
  let templates = []

  let days: Record<string, any> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    // friday: [ ],
    saturday: [],
    sunday: [],
  }

  let exerciseList_ = [...exerciseList]

  for (let i = 1; i <= 12; i++) {
    if (exerciseList_.length > 1) {
      let days_ = Object.keys(days)
      for (let day__ of days_) {
        let arr = days[day__]
        if (arr.length === 2) {
          continue
        }

        days[day__].push(exerciseList_[0])

        if (!exerciseList_[1]) {
          days[day__].push(exerciseList[0])
        }
        else {
          days[day__].push(exerciseList_[1])
        }

        exerciseList_.shift()
        if (exerciseList_.length > 0) {
          exerciseList_.shift()
        }

        if (exerciseList_.length === 0) {
          exerciseList_ = [...exerciseList]
        }
      }
    }
    else {
      days.monday.push(...exerciseList)
      days.tuesday.push(...exerciseList)
      days.wednesday.push(...exerciseList)
      days.thursday.push(...exerciseList)
      days.saturday.push(...exerciseList)
      days.sunday.push(...exerciseList)
    }

    // remove duplicates
    for (let v of Object.keys(days)) {
      days[v] = days[v].filter((t: any, i: any, a: any) => a.findIndex((v2: any) => (JSON.stringify(v2._id) === JSON.stringify(t._id))) === i)
    }


    templates.push({ week: i, weekCompleted: false, days })

    days = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      // friday: [ ],
      saturday: [],
      sunday: [],
    }
  }

  return { templates }
}

const removeTemplateDuplicates = (templates_: any) => {

  let templates = [...templates_]


  for (let q of templates) {
    let days = { ...q.days }

    for (let j of Object.keys(days)) {
      // @ts-ignore
      const filtered = days[j].filter((v: any, i: any, a: any) => a.findIndex((v2: any) => (v2._id?.toString() === v._id?.toString())) === i)
      days[j] = filtered
    }

    q.days = { ...days }
  }


  return templates
}
const generateTemplatesArrayForFirstTime = (exerciseList: any) => {

  try {

    let templates = []

    let days: Record<string, any> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    }

    for (let i = 1; i <= 13; i++) {

      let days_ = Object.keys(days)

      for (let day__ of days_) {

        let arr = days[day__]
        if (arr.length === 1) {
          continue
        }

        days[day__].push(exerciseList[0])

        if (!exerciseList[1]) {
          days[day__].push(exerciseList[0])
        }

        if (exerciseList.length > 0) {
          exerciseList.shift()
        }

        if (exerciseList.length === 0) {
          exerciseList = [...exerciseList]
        }
      }

      for (let v of Object.keys(days)) {
        days[v] = days[v].filter((t: any, i: any, a: any) => {
          if (!t || !t._id) {
            return false; // Filter out elements without _id
          }

          const firstIndex = a.findIndex((v2: any) => {
            if (!v2 || !v2._id) {
              return false; // Ignore elements without _id during comparison
            }

            return JSON.stringify(v2._id) === JSON.stringify(t._id);
          });

          return firstIndex === i;
        });
      }


      templates.push({ week: i, weekCompleted: false, days })

      days = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      }
    }


    return { templates }
  } catch (error: any) {
    console.log(error.message)
  }

}


const generateProgramForUser = async (userId: any) => {

  let problems_ = []
  let answers_ = []

  // console.log("user id=", userId);

  let user = await User.findById(userId)
  if (!user) throw new Error("Cannot generate exercise program. User does not exist")

  user = user.toObject()

  // cache user provided answers
  let answers: any = user.questionnaireAnswers
  if (!answers || Object.keys(answers).length === 0) throw new Error("User has not provided any answers.")
  answers_ = Object.values(answers)
  problems_ = [...answers_]


  // Exercises from phase 1 from 1 problem
  let generalExerciseList = await getAllGeneralExercises()


  let templates: any = generateTemplatesArrayForFirstTime(generalExerciseList)?.templates
  templates = removeTemplateDuplicates(templates)

  await Program.findOneAndUpdate({ userId }, { $set: { templates, userId } }, { upsert: true })
}

/**
 * @summary - Generate an exercise program for a user
 * @param userId
 */
const generatePosturalProgramForUser = async (userId: any) => {
  try {
    let problems_ = [];
    let answers_ = [];

    let user = await User.findById(userId);
    if (!user) throw new Error("Cannot generate exercise program. User does not exist");

    user = user.toObject();

    // Cache user provided answers
    let answers = user.questionnaireAnswers;
    if (!answers || Object.keys(answers).length === 0) throw new Error("User has not provided any answers.");
    answers_ = Object.values(answers);
    problems_ = [...answers_];

    // Exercises from phase 1 from 1 problem
    // if (problems_.length === 1) {
    try {
      let generalExerciseList = await getAllPosturalExercise();

      let templates = generateTemplatesArrayForFirstTime(generalExerciseList)?.templates;

      templates = removeTemplateDuplicates(templates);
      await ProgramForPosturalExercise.findOneAndUpdate({ userId }, { $set: { templates, userId } }, { upsert: true });
    } catch (innerError) {
      console.error("Error during program generation:", innerError);
      throw innerError;
    }
    // }
  } catch (error) {
    console.error("Error in generatePosturalProgramForUser:", error);
  }
};

// this code is fixed issues of same day exercise repeat 
function getTwoRandomNumber(number: number) {
  let number1 = Math.abs(Math.floor(Math.random() * number - 1));
  let number2 = Math.abs(Math.floor(Math.random() * number - 1));

  while (number1 === number2) {
    number2 = Math.abs(Math.floor(Math.random() * number - 1));
  }

  return { number1, number2 };
}

function getRandomNumber(number: number, exclude: Set<number> = new Set()) {
  let randomNum;
  do {
    randomNum = Math.abs(Math.floor(Math.random() * number - 1));
  } while (exclude.has(randomNum));
  return randomNum;
}

async function getExerciseList(userId: string) {
  try {
    let exerciseList = [];
    const user: any = await User.findOne({ _id: userId }, { questionnaireAnswers: 1 });

    if (!user || !user.questionnaireAnswers) return [];

    for (const key in user.questionnaireAnswers) {
      const exercises = user.questionnaireAnswers[key].questionnaire.queryBlock.filter((i: any) => i?.isExercise);
      for (const exercise of exercises) {
        exercise.answer = user.questionnaireAnswers[key].answer;
        exerciseList.push(exercise);
      }
    }

    return exerciseList;
  } catch (error: any) {
    console.log(error.message);
    return [];
  }
}


function exerciseSeederInTemplate(templates: any[], exercises: any[], usedExercises: Set<string> = new Set()) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  if (exercises.length === 0) {
    return;
  }

  if (exercises.length === 1) {
    for (const i of templates) {
      for (const j in i['days']) {
        if (days.includes(j)) {
          i['days'][j].push(exercises[0]);
        }
      }
    }
  } else {
    for (const i of templates) {
      for (const j in i['days']) {
        if (days.includes(j)) {
          const randomNumbers = getTwoRandomNumber(exercises.length);
          i['days'][j].push(exercises[randomNumbers.number1]);
          i['days'][j].push(exercises[randomNumbers.number2]);
          usedExercises.add(exercises[randomNumbers.number1]._id);
          usedExercises.add(exercises[randomNumbers.number2]._id);
        }
      }
    }
  }
}

async function fphOrRsExerciseGetAndSeed(exerciseList: any[], templates: any[], { fhpID, rsID }: { fhpID: string, rsID: string }) {
  try {
    const isExerciseFound = {
      fhp: false,
      rs: false
    };

    for (const i of exerciseList) {
      if (i.exerciseTag === "Forward head posture" && i.answer === "Yes") {
        isExerciseFound['fhp'] = true;

      } else if (i.exerciseTag === "Rounded shoulders" && i.answer === "Yes") {
        isExerciseFound['rs'] = true;
      }
    }

    if (!isExerciseFound.fhp && !isExerciseFound.rs) return;

    if (isExerciseFound.fhp) {
      const fhpExercises = await exerciseListModel.find({ tagId: fhpID });
      exerciseSeederInTemplate(templates, fhpExercises);
    }

    if (isExerciseFound.rs) {
      const rsExercises = await exerciseListModel.find({ tagId: rsID });
      exerciseSeederInTemplate(templates, rsExercises);
    }

    return;
  } catch (error: any) {
    console.log(error.message);
  }
}

async function programGeneration(userId: string) {
  try {
    const exerciseList: any = await getExerciseList(userId);
    if (exerciseList.length === 0) return "No exercises found";

    const program: any = await Program.findOne({ userId: userId }, { templates: 1 });
    let templates = program?.templates || [];

    const tags: any = await exerciseModel.findOne({ title: "Postural" }, { tags: 1, _id: 0 });
    const tagIds: Record<string, string> = {};
    tags.tags.forEach((tag: any) => {
      tagIds[tag.title.replace(/\s/g, "").toLowerCase()] = tag._id.valueOf();
    });

    // Check if user has any "Yes" answers for postural exercises
    const hasPosturalYes = exerciseList.some(
      (exercise: any) => exercise.exercise === "Postural" && exercise.answer === "Yes"
    );

    if (hasPosturalYes) {
      // Existing logic for "Yes" answers
      await fphOrRsExerciseGetAndSeed(exerciseList, templates, {
        fhpID: tagIds["forwardheadposture"],
        rsID: tagIds["roundedshoulders"],
      });

      const usedExerciseIds = new Set<any>();

      const specificTags = [
        "Increased kyphosis",
        "Forward tilted pelvis",
        "Elevated shoulders",
        "TMJ-pain",
        "Scapular winging",
        "Backward tilted pelvis"
      ];

      const tagExercises: Record<string, any[]> = {};
      for (const tag of specificTags) {
        const tagKey = tag.replace(/\s/g, "").toLowerCase();
        const tagId = tagIds[tagKey];
        if (tagId) {
          const exercises = await exerciseListModel.find({ tagId, exerciseParentName: "Postural" });
          tagExercises[tag] = exercises || [];
        } else {
          tagExercises[tag] = [];
        }
      }

      const otherExercises = [];
      for (const exercise of exerciseList) {

        if (exercise.exercise === "Postural" && exercise.answer === "Yes") {
          const tag = exercise.exerciseTag;

          if (specificTags.includes(tag) && Array.isArray(tagExercises[tag])) {

            for (const taggedExercise of tagExercises[tag]) {
              if (!usedExerciseIds.has(taggedExercise._id)) {
                otherExercises.push(taggedExercise);
                usedExerciseIds.add(taggedExercise._id);
              }
            }
          } else {
            // console.log(`No exercises found or not a specific tag: ${tag}`);
          }
        } else {
          // console.log(`Skipped exercise not selected or not postural:`, exercise);
        }
      }

      exerciseSeederInTemplate(templates, otherExercises, usedExerciseIds);
    } else {
      // New logic for when user answered "No" or has no postural exercises
      // Get all postural exercises
      const allPosturalExercises = await exerciseListModel.find({
        exerciseParentName: "Postural"
      });

      // Randomly select 4 exercises
      const randomExercises = [];
      const usedIndices = new Set();

      while (randomExercises.length < 4 && randomExercises.length < allPosturalExercises.length) {
        const randomIndex = Math.floor(Math.random() * allPosturalExercises.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          randomExercises.push(allPosturalExercises[randomIndex]);
        }
      }

      // Seed these exercises into the template
      exerciseSeederInTemplate(templates, randomExercises);
    }

    await Program.updateOne({ userId: userId }, { $set: { templates: templates } });
    return "Program is created";
  } catch (error: any) {
    console.error("Error in program generation:", error.message);
    return "Error in program generation";
  }
}

const getTotalQuestionCount = async (): Promise<number> => {
  return await Questionnaire.countDocuments();
};

export default { createQuestionnaire, retrieveQuestionnaire, listQuestionnaires, updateQuestionnaire, deleteQuestionnaire, listAllQuestionnaires, retrieveQuestionnairesWithPaginate, retrieveQuestionnaireWithPaginateAggregate, generateProgramForUser, listAllQuestionnairesSortedByCreatedAt, retrieveNextQuestionnaire, generatePosturalProgramForUser, programGeneration, getTotalQuestionCount }
