'use strict'

const Course = require('./course.model');
const {deleteSensitiveData} = require('../utils/validate')

exports.test = (req, res)=>{
    res.send({message: 'Course test running'});
}

exports.save = async(req, res)=>{
    try{
        let data = req.body;
        if(data.teacher || data.student) return res.send({message: 'Params teacher and student are not necessary'});
        data.teacher = req.user.sub;
        console.log(data);
        let course = await Course.find({name: data.name});
        for(let counter in course){
            if(course[counter].teacher == data.teacher) return res.send({message: 'You are a teacher of this course already'});
        }
        let newCourse = new Course(data);
        await newCourse.save();
        return res.send({message: 'Created Course'});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error creating course',  error: err.message});
    }
}

exports.assign = async(req, res)=>{
    try{
        let courseId = req.params.id;
        let courses = await Course.find().populate('teacher').lean();
        let alreadyCourses = [];
        for(let counter in courses){
            if(!courses[counter].student) continue
            if(courses[counter].student._id == req.user.sub) alreadyCourses.push(courses[counter]);
        }

        if(alreadyCourses.length == 3) return res.send({message: 'The limit of courses to assing is 3'});
        let courseFound = await Course.findOne({_id: courseId}).populate('teacher').populate('student').lean();
        if(!courseFound) return res.status(500).send({message: 'Course not found'});
        
        await deleteSensitiveData(courseFound.teacher);
        await deleteSensitiveData(courseFound.student);

        if(courseFound.student){
            let data = {
                name: courseFound.name,
                description: courseFound.description,
                teacher: courseFound.teacher,
                student: req.user.sub
            }
            let newCourse = new Course(data);
            await newCourse.save();
            return res.send({message: 'Course Created and Assigned'});
        }
        let assignedCourse = await Course.findOneAndUpdate(
            {_id: courseId},
            {student: req.user.sub},
            {new: true}
        ).populate('teacher').lean();
        await deleteSensitiveData(assignedCourse.teacher);
        return res.send({message: 'Assigned course', assignedCourse})
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error assigning course'});
    }
}

exports.get = async(req, res)=>{
    try{
        let account = req.user.sub;
        let courses = await Course.find().populate('teacher').lean();
        let personalCourses = [];
        for(let counter in courses){
            if(courses[counter].student == account){
                await deleteSensitiveData(courses[counter].teacher)
                personalCourses.push(courses[counter]);
            }
        }
        if(personalCourses.length == 0)return res.status(404).send({message: 'You are not assigned to any course'})
        return res.send({personalCourses})
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error getting course'});
    }
}

exports.update = async(req, res)=>{
    try{
        let data = req.body;
        let courseId = req.params.id;
        let account = req.user.sub;
        let personalCourse = await Course.findOne({_id: courseId});
        if(!personalCourse) return res.status(404).send({message: 'Course not found'});
        if(personalCourse.teacher != account) return res.send({message: 'You can only update your courses'});

        if(data.student) return res.send({message: 'Params student is unsupported'});
        let courseExists = await Course.findOne({name: data.name, teacher: account});
        if(courseExists && courseExists._id != courseId) return res.send({message: 'That course exists already: ', courseExists});
        
        let updatedCourse = await Course.updateMany(
            {name: personalCourse.name},
            data,
            {new:true}
        ).populate('teacher').lean();

        await deleteSensitiveData(updatedCourse.teacher);
        return res.status(201).send({updatedCourse});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error updating course'});
    }
}

exports.delete = async(req, res)=>{
    try{
        let courseId = req.params.id;
        let account = req.user.sub;
        let courseExists = await Course.findOne({_id: courseId, teacher: account});
        if(!courseExists) return res.status(404).send({message: 'Course not found and not deleted'});
        await Course.deleteMany(
            {name: courseExists.name, teacher: account}
        );
        return res.send({message: 'Course deleted'})
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error deleting course'});
    }
}

exports.getPersonalCourses = async(req, res)=>{
    try{
        let personalCourses = await Course.find({teacher: req.user.sub});
        if(!personalCourses) return res.status(404).send({message: `No courses found`});
        let courses = [];
        for(let counter in personalCourses){
            if(counter == 0){
                courses.push(personalCourses[0]);
                continue;
            } 
            if(personalCourses[counter-1].name != personalCourses[counter].name) courses.push(personalCourses[counter]);
        }
        console.log(courses);
        return res.send({courses})
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error getting courses'});
    }
}