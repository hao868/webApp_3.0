export const opts = {
	rotate: false,
	rotateLock: false,
	color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"],
	padding: [15, 5, 5, 5],
	dataLabel: true,
	fontSize: 12,
	legend: {
		show: true,
		position: "bottom",
		lineHeight: 24,
		fontSize: 12
	},
	title: {
		name: "",
		fontSize: 13,
		color: "#666666"
	},
	subtitle: {
		name: "",
		fontSize: 11,
		color: "#7cb5ec"
	},
	xAxis: {
		disableGrid: true
	},
	yAxis: {
		showTitle: true,
		data: [{
			min: 0,
			title: '金额/元',
			titleFontColor: "#888"
		}]
	},
	extra: {
		ring: {
			ringWidth: 30,
			activeOpacity: 0.5,
			activeRadius: 10,
			offsetAngle: 0,
			labelWidth: 0,
			border: false,
			borderWidth: 2,
			borderColor: "#FFFFFF",
			linearType: "custom"
		},
		pie: {
			activeOpacity: 0.5,
			activeRadius: 10,
			offsetAngle: 0,
			labelWidth: 0,
			border: false,
			borderWidth: 2,
			borderColor: "#FFFFFF",
			linearType: "custom"
		},
		mount: {
			type: "bar",
			widthRatio: 0.4,
			linearType: "custom"
		}
	}
}
