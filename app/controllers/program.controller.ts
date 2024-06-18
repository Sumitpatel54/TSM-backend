/* eslint-disable no-multi-spaces */
/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
import { Request, Response } from "express"

import ProgramService from "../services/program.service"
import commonUtilitie from "../utilities/common"

const apiUpdateProgram = async (req: Request, res: Response) => {
    let statusCode = 500

    try {
        const templateId: any = req.params.templateId
        const exerciseId: any = req.params.exerciseId
        const day: any = req.body.day
        const userId: any = req.user?.id

        commonUtilitie.validateRequestForEmptyValues({ day })

        // get user program
        const program = await ProgramService.retrieveProgram({ userId })

        if (!program || !Array.isArray(program.templates) || program.templates.length === 0) {
            statusCode = 400
            throw new Error("User does not have any exercise program.")
        }

        let template: any = program.templates.find((v: any) => (JSON.stringify(v._id) === JSON.stringify(templateId)))
        console.log(template["days"][day])
        let arr = template["days"][day]
        if (!Array.isArray(arr) || arr.length === 0) {
            statusCode = 400
            throw new Error("Something went wrong.")
        }
        for (let obj of arr) {
            if (JSON.stringify(obj._id) === JSON.stringify(exerciseId)) {
                obj.isCompleted = true
            }
        }

        let body = { "$set": { [`templates.$.days.${day}`]: arr } }

        const response = await ProgramService.updateProgram(templateId, body)

        return res.status(200).send({
            status: true,
            data: response,
            message: "Program Record Updated"
        })
    } catch (error: any) {
        return res.status(statusCode).send({
            status: false,
            message: error.message
        })
    }
}

// const apiGetUserGeneralPosturalExerciseProgram = async (req: Request, res: Response) => {
//   let statusCode = 500

//   try {
//       const userId: any = req.user?.id

//       // get user exercise program
//       let exerciseProgram:any = await ProgramService.retrieveProgram({ userId })
//       exerciseProgram = exerciseProgram?.toObject()

//       if (Array.isArray(exerciseProgram?.templates) && exerciseProgram.templates.length > 0) {
//         let templates = [ ...exerciseProgram.templates ]

//         for (let i = 0; i < templates.length; i++) {
//           let obj = { ...templates[i] }
//           let weekCompleted = false
//           let Exercises = []

//           if (obj.days && Object.keys(obj.days).length > 0) {
//             for (let day__ of Object.keys(obj.days)) {
//               let day = day__

//               if (Array.isArray(obj.days[day])) {
//                 let dayCompleted = false

//                 // loop through each array in day day and compute the day and week isCompleted
//                 for (let k = 0; k < obj.days[day]; k++) {
//                   dayCompleted = !!obj.days[day][k]?.isComplete
//                   weekCompleted = !!obj.days[day][k]?.isComplete
//                 }

//                 // create exercises object
//                 let exObj = {
//                   "day": day,
//                   dayCompleted,
//                   exercise: obj.days[day].filter((item: any) => {
//                     if (req.path === "/general") {
//                       return (item.exerciseParentName === "General" || item.exerciseParentName === "general")
//                     }
//                     else if (req.path === "/postural") {
//                       return (item.exerciseParentName === "Postural" || item.exerciseParentName === "postural")
//                     }
//                     return true
//                   })
//                 }

//                 Exercises.push(exObj)
//               }
//             }
//           }

//           obj.weekCompleted = weekCompleted
//           obj.Exercises = Exercises
//           delete obj.days
//           templates[i] = obj
//         }

//         exerciseProgram.templates = templates
//       }

//       return res.status(200).send({
//         status: true,
//         data: exerciseProgram,
//         message: "Successfully retreived."
//       })
//   } catch (error: any) {
//       return res.status(statusCode).send({
//           status: false,
//           message: error.message
//       })
//   }
// }

const apiGetUserNotCompletedExercisProgram = async (req: Request, res: Response) => {
    let statusCode = 500

    try {
        const userId: any = req.user?.id

        // get user exercise program
        let exerciseProgram = await ProgramService.retrieveProgram({ userId })

        if (exerciseProgram) {
            exerciseProgram = exerciseProgram.toObject()
        }

        let templates: any = exerciseProgram?.templates

        if (!Array.isArray(templates) || templates.length === 0) {
            statusCode = 400
            throw new Error("Exercise program does not exist.")
        }

        for (let i = 0; i < templates.length; i++) {
            let obj: any = templates[i]
            let days: any = Object.keys(obj.days)

            for (let j of days) {
                if (Array.isArray(obj.days[j]) && obj.days[j].length > 0) {
                    obj.days[j] = obj.days[j].filter((v: any) => !v.isCompleted)
                }
            }

            templates[i] = obj
        }

        return res.status(200).send({
            status: true,
            data: templates,
            message: "Successfully retreived."
        })
    } catch (error: any) {
        return res.status(statusCode).send({
            status: false,
            message: error.message
        })
    }
}

const apiGetBothUserGeneralPosturalExerciseProgram = async (req: Request, res: Response) => {
    let statusCode = 500;

    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).send({
                status: false,
                message: 'User ID is required',
            });
        }

        // Get user exercise program
        const exerciseProgramDoc = await ProgramService.retrieveProgram({ userId });

        // Ensure programs are either null or plain objects
        const exerciseProgram = exerciseProgramDoc ? exerciseProgramDoc.toObject() : null;

        // Initialize arrays to store templates
        const templateForGeneral: any[] = [];
        const templateForPostural: any[] = [];

        const processTemplates = (program: any, templateArray: any[], parentName: string) => {
            if (Array.isArray(program?.templates) && program.templates.length > 0) {
                let templates = [...program.templates];

                for (let i = 0; i < templates.length; i++) {
                    let obj = { ...templates[i] };
                    let weekCompleted = false;
                    let Exercises = [];

                    if (obj.days && Object.keys(obj.days).length > 0) {
                        for (let day__ of Object.keys(obj.days)) {
                            let day = day__;

                            if (Array.isArray(obj.days[day])) {
                                let dayCompleted = false;

                                // Loop through each array in day and compute the day and week isCompleted
                                for (let k = 0; k < obj.days[day].length; k++) {
                                    dayCompleted = dayCompleted && !!obj.days[day][k]?.isComplete;
                                    weekCompleted = weekCompleted && !!obj.days[day][k]?.isComplete;
                                }

                                // Create exercises object
                                let exObj = {
                                    "day": day,
                                    dayCompleted,
                                    exercise: obj.days[day].filter((item: any) => {
                                        return item.exerciseParentName === parentName;
                                    })
                                };

                                if (exObj.exercise.length > 0) {
                                    Exercises.push(exObj);
                                }
                            }
                        }
                    }

                    obj.weekCompleted = weekCompleted;
                    obj.Exercises = Exercises;
                    delete obj.days;
                    templates[i] = obj;
                }

                templateArray.push(...templates);
            }
        };

        // Process general exercises and postural exercises
        if (exerciseProgram) {
            processTemplates(exerciseProgram, templateForGeneral, "General");
            processTemplates(exerciseProgram, templateForPostural, "Postural");
        }

        return res.status(200).send({
            status: true,
            data: {
                _id: exerciseProgramDoc?._id,  // Add the _id field to the response
                templateForGeneral,
                templateForPostural,
            },
            message: "Successfully retrieved."
        });
    } catch (error: any) {
        console.error('Error retrieving exercise program:', error);
        return res.status(statusCode).send({
            status: false,
            message: error.message
        });
    }
};



const apiGetUserGeneralPosturalExerciseProgram = async (req: Request, res: Response) => {
    let statusCode = 500;

    try {
        const userId: any = req.user?.id;

        // get user exercise program
        let exerciseProgram: any = await ProgramService.retrieveProgram({ userId });
        exerciseProgram = exerciseProgram?.toObject();

        if (Array.isArray(exerciseProgram?.templates) && exerciseProgram.templates.length > 0) {
            let templates = [...exerciseProgram.templates];

            for (let i = 0; i < templates.length; i++) {
                let obj = { ...templates[i] };
                let weekCompleted = false;
                let Exercises = [];

                if (obj.days && Object.keys(obj.days).length > 0) {
                    for (let day__ of Object.keys(obj.days)) {
                        let day = day__;

                        if (Array.isArray(obj.days[day])) {
                            let dayCompleted = false;

                            // loop through each array in day and compute the day and week isCompleted
                            for (let k = 0; k < obj.days[day].length; k++) {
                                dayCompleted = !!obj.days[day][k]?.isComplete;
                                weekCompleted = weekCompleted && !!obj.days[day][k]?.isComplete;
                            }

                            // create exercises object
                            let exObj = {
                                "day": day,
                                dayCompleted,
                                exercise: obj.days[day].filter((item: any) => {
                                    if (req.path === "/general") {
                                        return item.exerciseParentName === "General" || item.exerciseParentName === "general";
                                    }
                                    else if (req.path === "/postural") {
                                        return item.exerciseParentName === "Postural" || item.exerciseParentName === "postural";
                                    }
                                    return true;
                                })
                            };

                            if (exObj.exercise.length > 0) {
                                Exercises.push(exObj);
                            }
                        }
                    }
                }

                obj.weekCompleted = weekCompleted;
                obj.Exercises = Exercises;
                delete obj.days;
                templates[i] = obj;
            }

            exerciseProgram.templates = templates;
        }

        return res.status(200).send({
            status: true,
            data: exerciseProgram,
            message: "Successfully retrieved."
        });
    } catch (error: any) {
        return res.status(statusCode).send({
            status: false,
            message: error.message
        });
    }
};


const apiChangeUserExerciseStatus = async (req: Request, res: Response) => {
    let statusCode = 500
    let days: any

    try {
        const userId: any = req.user?.id
        const id = req.params.id
        const templateId = req.params.templateId
        const status = req.body.status
        const day = req.body.day?.toLowerCase()
        const exerciseId = req.body.exerciseId

        commonUtilitie.validateRequestForEmptyValues({ day, userId })

        // get program
        let exerciseProgram: any = await ProgramService.retrieveProgram({ _id: id, userId })

        if (!exerciseProgram) {
            throw new Error("Exercise program does not exist.")
        }

        exerciseProgram = exerciseProgram.toObject()

        for (let temp of exerciseProgram.templates) {
            if (JSON.stringify(temp._id) === JSON.stringify(templateId)) {
                days = temp.days
            }
        }

        if (!days) {
            throw new Error("Exercise program does not exist.")
        }

        // update status locally
        for (let day_ of days[day]) {
            if (JSON.stringify(day_._id) === JSON.stringify(exerciseId)) {
                day_.isComplete = status
            }
        }

        const query = { $set: { "templates.$.days": days } }

        const updateResponse = await ProgramService.updateProgramWithSet({ _id: id, "templates._id": templateId }, query)
        return res.status(200).send({
            status: true,
            data: updateResponse,
            message: "Program Record Updated"
        })
    } catch (error: any) {
        return res.status(statusCode).send({
            status: false,
            message: error.message
        })
    }
}

const apiGetReportBlock = async (req: Request, res: Response) => {
    let statusCode = 500

    try {
        const userId: any = req.user?.id

        // get user report
        const report = await ProgramService.retrieveReportBlock({ _id: userId })

        return res.status(200).send({
            status: true,
            data: report,
            message: report ? "Report generated" : "Report not generated"
        })
    } catch (error: any) {
        return res.status(statusCode).send({
            status: false,
            message: error.message
        })
    }
}

export default { apiUpdateProgram, apiGetReportBlock, apiChangeUserExerciseStatus, apiGetUserNotCompletedExercisProgram, apiGetUserGeneralPosturalExerciseProgram, apiGetBothUserGeneralPosturalExerciseProgram }
