const fs = require('fs');
const csv = require('csv-parser');
const make_stimuli = require('./make_stimuli')
const make_folder = require('./make_folder')
const split_stimuli_to_blocks = require('./split_stimuli_to_blocks')
const make_block_csv = require('./make_block_csv')
const make_audio = require('./make_audio')
const all_sets = JSON.parse(fs.readFileSync('./selected-7-note-sets.json','utf-8'))
const matrix = JSON.parse(fs.readFileSync('./subject_matrix.json','utf-8'))
const EDO = require("edo.js").EDO


/**Set Settings here*/
async function gen_task_set (sub_id,prefix="10SVG",root='./task_sets') {
        let sub = matrix.filter(row=>row.subject_id==sub_id)[0]
        const edo = new EDO(10)
        const sub_name = prefix + "0".repeat(4-String(sub_id).length) + String(sub_id)

        make_folder(root,"/" + sub_name)
        make_folder(root + "/" + sub_name,["/audio","/csv"])
        /**Experiment 1*/
        const stimuli_diatonic = make_stimuli(sub_name,25,4,[0,1,3,5,6,8]) /**Set Settings here*/








    // const stimuli = edo.shuffle_array([].concat(stimuli_diatonic).concat(stimuli_harmonic).concat(stimuli_lyd7b))
    //                 .map((e,i)=>{
    //                     e.question=i+1
    //                     return e}) /**Make big array with all kinds of diatonic conditions and shuffle it*/

        const stimuli = edo.shuffle_array(stimuli_diatonic)
                .map((stimulus,Q_num)=>{
                    stimulus.Q_num = Q_num+1
                    stimulus.fragment_file = "Q-" +(Q_num+1)+ "-000-fragment.mp3"
                    stimulus.option1_file = "Q-" +(Q_num+1)+ "-001-" + stimulus.order[0] + '.mp3'
                    stimulus.option2_file = "Q-" +(Q_num+1)+ "-002-" + stimulus.order[1] + '.mp3'
                    return stimulus
                })

        const blocks = split_stimuli_to_blocks(stimuli,4)

        const process_block_audio = function (block) {
            const audio_dir = root+"/" + sub_name +"/audio/"
            let mp3 = []
            block.forEach((stimulus,Q_num)=>{
                mp3.push(make_audio(stimulus[stimulus.order[0]].slice(0,stimulus.fragment_generic.length+1),audio_dir + stimulus.fragment_file),make_audio(stimulus[stimulus.order[0]],audio_dir + stimulus.option1_file),make_audio(stimulus[stimulus.order[1]],audio_dir + stimulus.option2_file))
            })
            return Promise.all(mp3)

        }
        async function process_block  (block_num=0) {
                if(block_num<blocks.length) {
                    console.log(sub_name,"processing block " + (block_num+1))
                    let block = blocks[block_num]
                    block.forEach((stimulus,Q_num)=>{
                        stimulus.block = block_num+1
                    })
                    make_block_csv(sub_name,root+"/" + sub_name +"/",block_num+1,block)
                    await process_block_audio(block)
                    console.log("created block " + parseInt(block_num+1) +" audio")
                    await process_block(block_num+1)
                }
        }
        await process_block(0).then(function () {
            console.log("finished", sub_name)
        })
    return sub_name
}


module.exports = gen_task_set



gen_task_set(3)
