import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ChartSelectEvent } from 'ng2-google-charts';
import { VirtualTimeScheduler } from 'rxjs';


@Component({
  selector: 'app-statement1',
  templateUrl: './statement1.component.html',
  styleUrls: ['./statement1.component.css']
})
export class Statement1Component implements OnInit {
  // Array Declaration
  academicYears: string[] = [];
  termnumbers: [] = [];
  attendance_details = [];
  placement_offers:any[] = [];
  user_role:string[] =[];
  faculty_role:string[] = ["FACULTY" ];
  faculty_roles:string[] = ["FACULTY" , "COUNSELLOR"];
  hod_role:string[] = ["FACULTY" , "DEPT_ADMIN" , "HOD"];
  principal_role:string[] = ["FACULTY" , "COLLEGE_ADMIN" , "PRINCIPAL"];
  student_role:string[] = ["STUDENT"];
  fac_attend_details:any[] = [];
  faculty_names:any[] =[];
  dept_names:any[] = [];
  //Chart Declarations
  public firstLevelChart: GoogleChartInterface;
  public faculty_chart:GoogleChartInterface;
  //string declarations
  title: string;
  error_message: string
  single_course_name :string;
  //boolean Declarations
  error_flag = false
  chart_visibility = false;
  fac_chart_visibility = false;
  showSpinner = false;
  facSpinner = false;
  placement_status_deiplayed = false;
  logged_hod = false;
  logged_faculty = false;
  logged_student = false;
  logged_princi = false;
  hide_details_princi = false;
  pop_up = false;
  //data type declaration
  terms;
  selectedyear;
  user_info;
  course_name;
  total_present;
  total_class;
  faculty_id;
  dept_name:any;
  princi_Department;
  current_faculty;
  course_modal;
  placed_modal;
  total_stu_modal;
  total_pos_modal;
  

  constructor(private analyticsService: AnalyticsService, private authService: AuthService) { }

  ngOnInit() {
    let u_info = localStorage.getItem('user');
    let u = JSON.parse(u_info);
    this.faculty_id = u['employeeGivenId'];
    this.user_role = u['roles'];
    if (JSON.stringify(this.user_role) == JSON.stringify(this.hod_role))
    {
      this.logged_hod = true;
    }
    else if (JSON.stringify(this.user_role) == JSON.stringify(this.faculty_role) || JSON.stringify(this.user_role) == JSON.stringify(this.faculty_roles))
    {
      this.logged_faculty = true;
    }
    else if (JSON.stringify(this.user_role) == JSON.stringify(this.student_role))
    {
      this.logged_student = true;
    }
    else if(JSON.stringify(this.user_role) == JSON.stringify(this.principal_role))
    {
      this.logged_princi = true;
    }
    this.user_info = this.authService.getUserInfo()
    this.get_academic_years()
    this.get_term_numbers()
    this.analyticsService.get_dept().subscribe(res=>{
      let re = res['dept'];
      for(let r of re)
      {
        this.dept_names.push(r)
      }
    })
  }

  get_academic_years() {
    this.analyticsService.get_academic_years().subscribe(res => {
      this.academicYears = res['acdemicYear']
    })
  }

  get_term_numbers() {
    this.analyticsService.get_term_details().subscribe(res => {
      this.termnumbers = res['term_numbers']
    }
    )
  }

  studentsearch() {
    if (!this.placement_status_deiplayed) {
      this.getPlacementDetails()
    }
    this.showSpinner = true;
    this.analyticsService.get_attendance_details(this.user_info['usn'], this.selectedyear, this.terms).subscribe(res => {
      this.attendance_details = res['attendance_percent']
      this.attendace_data(this.attendance_details)
    })
    
  }

  getPlacementDetails() {
    this.placement_status_deiplayed = true;
    this.analyticsService.get_offer_by_usn(this.selectedyear, this.user_info['usn']).subscribe(res => {
      let re = res["offers"];
      for (let r of re) {
        this.placement_offers.push([r['companyName'], r['salary']])
      }
    })
  }

  attendace_data(data) {
    let dataTable = []
    dataTable.push([
      "CourseCode",
      "Attendance %", { type: 'string', role: 'tooltip' }
    ]);

    for (let i = 0; i < data.length; i += 1) {
      dataTable.push([data[i]['courseCode'],
      data[i]['attendance_per'], "Attendance % : " + data[i]['attendance_per']])
    }

    if (dataTable.length > 1) {
      this.chart_visibility = true
      this.error_flag = false
      this.graph_data(dataTable)
    }
    else {
      this.showSpinner = false;
      this.error_flag = true
      this.error_message = "Data doesnot exist for the entered criteria"
    }
  }

  back_() {
    this.chart_visibility = false
  }


  graph_data(data) {
    this.showSpinner = false
    this.title = 'Course-wise Attendance %',
      this.firstLevelChart = {
        chartType: "ColumnChart",
        dataTable: data,
        options: {
          bar: { groupWidth: "10%" },
          vAxis: {
            title: "Percentage",
            viewWindow: {
              max:100,
              min:0
          }
          },

          height: 800,
          hAxis: {
            title: "Courses",
            titleTextStyle: {
            }
          },
          chartArea: {
            left: 80,
            right: 100,
            top: 100,
          },
          legend: {
            position: "top",
            alignment: "end"
          },
          seriesType: "bars",
          colors: ["#0099cc"],
          fontName: "Times New Roman",
          fontSize: 13,

        }

      }
  }
  second_level(event: ChartSelectEvent) {
    let subcode = event.selectedRowFormattedValues[0];
    if (subcode)
    {
    this.analyticsService.get_attendence_by_course(subcode, this.user_info['usn']).subscribe(res => {
      let re = res["res"];
      this.course_name = re[0]['courseName'];
      this.total_present = re[0]['presentCount'];
      this.total_class = re[0]['totalNumberOfClasses'];
      
    })
    }
  }

  // Faculty Module

  draw_faculty_chart(data)
  {
    this.facSpinner =false;
    this.title = 'Course-wise Attendance %',
    this.faculty_chart = {
      chartType: "ComboChart",
      dataTable: data,
      options: {
        bar: { groupWidth: "10%" },
        vAxis: {
          title: "Percentage",
          viewWindow: {
            max:100,
            min:0
        }
        },

        height: 800,
        hAxis: {
          title: "Courses",
          titleTextStyle: {
          }
        },
        chartArea: {
          left: 80,
          right: 100,
          top: 100,
        },
        legend: {
          position: "top",
          alignment: "end"
        },
        seriesType: "bars",
        colors: ["#0099cc","#ff6600"],
        fontName: "Times New Roman",
        fontSize: 13,

      }

    }
  }

  faculty_level(event: ChartSelectEvent) {
    let subcode = event.selectedRowFormattedValues[0];
    if(subcode){
      
      this.pop_up = true;
    this.analyticsService.get_placed_details(this.current_faculty,subcode,this.terms).subscribe(res=>{
      let re = res
      this.course_modal = re['courseCode'];
      this.placed_modal = re['placedStudents'];
      this.total_pos_modal = re['totalPositions'];
      this.total_stu_modal = re['totalStudents'];
    })
  }
  }

  facultysearch()
  {
    this.current_faculty = this.faculty_id;
    this.facSpinner = true;
    this.analyticsService.get_selected_faculty_details(this.faculty_id,this.terms).subscribe(res =>{
      let re = res["fac"];
      let db = [];
      db.push(["Course Name","Total Percent","placePercentage"])
      for(let r of re)
      {
        db.push([r['courseid'],r['totalPercentage'],r['placePercentage']])
      }
      if (db.length > 1) {
        this.fac_chart_visibility = true
        this.facSpinner = false
        this.error_flag = false
        this.draw_faculty_chart(db)
      }
      else {
        this.showSpinner = true;
        this.error_flag = true
        this.error_message = "Data doesnot exist for the entered criteria"
      }
    })
  }

  getFacultyDetails(fac_id)
  {

    this.current_faculty = fac_id
    this.facSpinner= true;
    this.analyticsService.get_selected_faculty_details(fac_id,this.terms).subscribe(res =>{
      let re = res["fac"];
      let db = [];
      db.push(["Course Name","Total Percent","Placement Percentage"])
      for(let r of re)
      {
        db.push([r['courseid'],r['totalPercentage'],r['placePercentage']])
      }
      if (db.length > 1) {
        this.fac_chart_visibility = true
        this.error_flag = false
        this.facSpinner = false;
        this.draw_faculty_chart(db)
      }
      else {
        this.showSpinner = false;
        this.error_flag = true
        this.error_message = "Data doesnot exist for the entered criteria"
      }
    })
  }

  // HOD MODULE

  hodsearch()
  {
    this.fac_chart_visibility = false;
    this.error_flag = false;
    this.facSpinner = false;
    this.faculty_names = [];
    this.get_faculty_details();
  }

  get_faculty_details() {
    let us = localStorage.getItem('user');
    let u = JSON.parse(us);
    let arr = u['employeeGivenId'];
    let patt = new RegExp("[a-zA-z]*");
    let res = patt.exec(arr);
    this.dept_name =res[0];
    this.analyticsService.get_faculty_names(this.dept_name).subscribe(res => {
      let na = res['faculty'];
      for (let n of na) {
        this.faculty_names.push([n['employeeGivenId'],n['name'].toUpperCase()]);
      }
    })
  }

  

  //principal

  princisearch()
  {
    this.fac_chart_visibility = false;
    this.error_flag = false;
    this.facSpinner = false;
    this.faculty_names = [];
    this.get_faculty_details1();
  }

  get_faculty_details1() {
    this.analyticsService.get_faculty_names(this.princi_Department).subscribe(res => {
      let na = res['faculty'];
      for (let n of na) {
        this.faculty_names.push([n['employeeGivenId'],n['name'].toUpperCase()]);
      }
      this.hide_details_princi = true;
    })
  }
}
