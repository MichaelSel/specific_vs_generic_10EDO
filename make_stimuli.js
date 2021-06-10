const EDO = require("edo.js").EDO
let edo = new EDO(10)
const mod = (n, m) => {
    return ((n % m) + m) % m;
}
const JS = function (thing) {
    return JSON.stringify(thing).replace(/"/g,'')
}

const CJS = function (thing) {
    console.log(JS(thing))
}
const rand_int_in_range = function (min,max) {
    return Math.floor(Math.random() * (max - min +1)) + min
}

const rand_int_in_range_but_not_zero = function (min,max) {
    let val = Math.floor(Math.random() * (max - min +1)) + min
    while(val==0) val = Math.floor(Math.random() * (max - min +1)) + min
    return val
}



const make_stimuli = function (subject_id,total_fragments=3,questions_per_fragment=7,diatonic_pitches = [0,2,4,5,7,9,11]) {

    let order_pseudoR = Array.from(Array(Math.ceil(total_fragments*questions_per_fragment/2)).fill(['diatonic','chromatic']))
    let order_pseudoR2 = Array.from(Array(Math.ceil(total_fragments*questions_per_fragment/2)).fill(['chromatic','diatonic']))
    order_pseudoR = [...order_pseudoR,...order_pseudoR2]
    order_pseudoR = edo.shuffle_array(order_pseudoR)


    let transposition_pseudo = edo.shuffle_array(Array.from(Array(total_fragments*questions_per_fragment).fill(Array.from(Array(7).keys()))).flat())



    const diatonic = edo.scale(diatonic_pitches)


    const make_fragment = function (fragment_length=rand_int_in_range(2,3),max_traverse=2,min_ginterval=-2,max_ginterval=2) {
        let interval_fragment = []
        for (let i = 0; i < fragment_length; i++) {
            interval_fragment.push(rand_int_in_range_but_not_zero(min_ginterval,max_ginterval))
        }
        let interval_fragment_traverse = interval_fragment.reduce((ag,e)=>ag+e,0)
        if(Math.abs(interval_fragment_traverse)>max_traverse || interval_fragment_traverse==0) return make_fragment(fragment_length,max_traverse,min_ginterval,max_ginterval)

        return interval_fragment
    }

    const create_trial = function (fragment,scale = edo.scale(diatonic_pitches),starting_pitch=0,repeat_fragment = 4,) {
        let fragment_as_pitches = scale.get.melody_from_intervals(fragment)
        let fragment_as_semitones = edo.convert.to_steps(fragment_as_pitches)

        let generic_repeat = Array.from(Array(repeat_fragment).fill(fragment).flat())
        let specific_repeat = Array.from(Array(repeat_fragment).fill(fragment_as_semitones).flat())

        let diatonic_melody = scale.get.melody_from_intervals(generic_repeat,1,starting_pitch)
        let chromatic_melody = edo.convert.intervals_to_pitches(specific_repeat,starting_pitch)

        let unique_diatonic = edo.scale(diatonic_melody).pitches.length
        let unique_chromatic = edo.scale(chromatic_melody).pitches.length


        return {subject_id:subject_id,diatonic: diatonic_melody,chromatic:chromatic_melody,unique_diatonic:unique_diatonic,unique_chromatic:unique_chromatic, necklace:diatonic_pitches, scale:scale.pitches, fragment_generic: fragment, fragment_specific: fragment_as_semitones,fragment_span:fragment.reduce((ag,e)=>ag+e,0)}

    }

    let fragments = []
    while(fragments.length<total_fragments) {
        let frag = make_fragment()
        if(edo.is.element_of(frag,fragments)) continue
        fragments.push(frag)
    }

    let stimuli = []

    fragments.forEach(frag=>{
        let modes = edo.shuffle_array(Array.from(Array(7).keys()),false)
        if(questions_per_fragment<modes.length) {
            modes = modes.slice(0,questions_per_fragment)
        }
        modes.forEach(mode=>{
            let valid=false
            let trial
            let starting_pitch = transposition_pseudo.pop()
            while(valid==false) {

                trial = create_trial(frag,diatonic.mode(mode),starting_pitch)



                //Check that the range is not too low
                if(Math.min(...trial.chromatic)>-12 && Math.min(...trial.diatonic)>-12) {
                    trial.mode=mode
                    trial.transposition = starting_pitch
                    valid=true
                }
                else {
                    starting_pitch++
                }

                /**If the chromatic and diatonic versions produce the same pitches, generate a new melody with the next available mode*/
                if(edo.is.same(trial.diatonic,trial.chromatic)) {
                    valid=false
                    mode+=1
                }



            }
            trial.order = order_pseudoR.pop()
            stimuli.push(trial)
        })

    })
    stimuli = edo.shuffle_array(stimuli)

    return stimuli


}

// let stimuli = make_stimuli()
// stimuli.forEach(stim=>{
//     CJS(stim)
// })


module.exports = make_stimuli


