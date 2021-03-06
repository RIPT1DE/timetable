const jetpack = require("fs-jetpack");
const days = require('./days')
const { getSelectedIds } = require('./selectdIds')

var out = []; // [{"MG101": "A", "CS203": "B"}, {"MG101", "D", "CS203": "F"}]

var timetable;

function readTimetable() {
	if (!timetable) timetable = jetpack.read("./temp.json", "json");

	return timetable;
}

function getAllPossibleSections() {
	if (!timetable)
		readTimetable();


	if (out.length == 0) {
		const selectedIds = getSelectedIds();
		const sectionMappingTemplate = selectedIds.reduce(
			(obj, section) =>
				Object.assign(obj, {
					[section]: null,
				}),
			{}
		);

		var currentSectionMappings = Object.assign({}, sectionMappingTemplate);

		function checkClash(course_index, section) {
			var tempTimings, curr, temp;
			var crsTimings = timetable[selectedIds[course_index]].timings[section];
			var clashing = false;
			for (let i of days) {
				curr = crsTimings[i];
				if (curr != null) {
					//selected course has a class on the current day
					selectedIds.forEach((val, ind) => {
						if (ind < course_index && !clashing) {
							tempTimings =
								timetable[val].timings[currentSectionMappings[val]][i];
							//console.log(tempTimings, curr);
							if (tempTimings != null) {
								if (
									(tempTimings[0] > curr[0] && tempTimings[0] < curr[1]) ||
									(tempTimings[1] > curr[0] && tempTimings[1] < curr[1]) ||
									(tempTimings[0] == curr[0] && tempTimings[0] == curr[0])
								) {
									clashing = true;
								}
							}
						}
					});
				}
			}
			return clashing;
		}

		function allPossibleSections(index) {
			if (index == selectedIds.length)
				out.push(Object.assign({}, currentSectionMappings));
			else {
				var clashed;
				if (selectedIds[index].charAt(1) == "L") {
					var labSection;
					for (var i = 1; i <= 1; i++) {
						//select proper section for lab classes
						labSection =
							currentSectionMappings[selectedIds[index - 1]] + "" + i;
						if (!checkClash(index, labSection)) {
							currentSectionMappings[selectedIds[index]] = labSection;
							allPossibleSections(index + 1);
						}
					}
				} else {
					//console.log(timetable[selectedIds[index]]);
					for (let section in timetable[selectedIds[index]]["timings"]) {
						clashed = checkClash(index, section);
						if (!clashed) {
							currentSectionMappings[selectedIds[index]] = section;
							allPossibleSections(index + 1);
						}
					}
				}
			}
		}

		allPossibleSections(0);
		jetpack.write("./output.json", out);
	}

	return out;
}

module.exports = {
	readTimetable,
	getAllPossibleSections,
};
