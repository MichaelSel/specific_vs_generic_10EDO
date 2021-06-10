const fs = require('fs');
const csv = require('csv-parser');

const make_block_csv = function (participant_id, participant_dir, block_num, stimuli) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;





    let data =stimuli.map((stim,i) => {
        let dat = {
            subject_id: stim.subject_id,
            question: i+1,
            block_num: block_num,
            diatonic: stim.diatonic,
            chromatic: stim.chromatic,
            unique_diatonic:stim.unique_diatonic,
            unique_chromatic:stim.unique_chromatic,
            necklace:stim.necklace,
            scale: stim.scale,
            mode:stim.mode,
            fragment_generic:stim.fragment_generic,
            fragment_specific:stim.fragment_specific,
            fragment_span: stim.fragment_span,
            order:stim.order,
            transposition:stim.transposition,
            fragment_file:stim.fragment_file,
            option1_file:stim.option1_file,
            option2_file:stim.option2_file

        }
        return dat
    })
    fs.writeFile(participant_dir + "csv/" + "block_" + block_num + ".json", JSON.stringify(data), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    const csvWriter = createCsvWriter({
        path: participant_dir + "csv/" + "block_" + block_num + ".csv",
        header: Object.keys(data[0]).map(el=>{return {id:el,title:el}})
    }).writeRecords(data)
        .then(()=> console.log("CSV file subject",participant_id,"block", block_num,"was successfully created."));
}

module.exports = make_block_csv