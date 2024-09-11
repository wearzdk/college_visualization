from typing import List, TypedDict
from fastapi import FastAPI
import numpy as np
from backend import db

app = FastAPI()

# cors
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

class CollegeJobCompany(TypedDict):
    college_name: str
    job_attr: str
    job_company: str

# 获取大学就业信息
@app.get("/university-employment-info")
def get_university_employment_info(college_name: str):
  queryResult = db.query("SELECT * FROM college_job_company WHERE college_name = %s", (college_name,))
  result: List[CollegeJobCompany] = []
  for row in queryResult:
    result.append({
      "college_name": row[2],
      "job_attr": row[3],
      "job_company": row[4]
    })
  return result




# 获取高校分数线与毕业生就业情况关联
# 统计不同分数线高校的毕业生在国企和私企的就业比例【箱线图】
# 相关表定义：
### 'college_mark':
# "college_id"
# "college_name"
# "college_code"
# "low_rank"
# "low_mark"
# "high_mark"
# "high_rank"
# "num"
# "year"
@app.get("/college-scores-and-graduates-employment")
def get_college_scores_and_graduates_employment():
    # 查询高校分数线数据
    college_marks = db.query("SELECT college_name, low_mark, high_mark FROM college_mark WHERE year = (SELECT MAX(year) FROM college_mark)")
    
    # 查询高校就业数据
    employment_data = db.query("SELECT college_name, job_attr FROM college_job_company")
    
    # 处理数据
    result = []
    for college in college_marks:
        college_name = college[0]
        low_mark = college[1]
        high_mark = college[2]
        average_mark = (low_mark + high_mark) / 2
        
        # 查找对应的就业数据
        job_attr = next((item[1] for item in employment_data if item[0] == college_name), None)
        
        if job_attr:
            job_attr_dict = eval(job_attr)
            state_owned = float(job_attr_dict.get('国有企业', 0))
            private = float(job_attr_dict.get('民营企业', 0))
            
            total = state_owned + private
            state_owned_ratio = state_owned / total if total > 0 else 0
            private_ratio = private / total if total > 0 else 0
            
            result.append({
                "college_name": college_name,
                "average_mark": average_mark,
                "state_owned_ratio": state_owned_ratio,
                "private_ratio": private_ratio
            })

    score_ranges = [(510, 530), (530, 550), (550, 570), (570, 590), (590, 610), (610, 630), (630, 650), (650, 670), (670, 690)]
    final_result = []
    for score_range in score_ranges:
        filtered_result = [item for item in result if score_range[0] <= item["average_mark"] < score_range[1]]
        # 统计每个分数段的比例
        state_owned_count = sum(item["state_owned_ratio"] for item in filtered_result)
        private_count = sum(item["private_ratio"] for item in filtered_result)
        total_count = state_owned_count + private_count
        state_owned_ratio = state_owned_count / total_count if total_count > 0 else 0
        private_ratio = private_count / total_count if total_count > 0 else 0
        final_result.append({
            "score_range": f"{score_range[0]}-{score_range[1]}",
            "state_owned_ratio": state_owned_ratio,
            "private_ratio": private_ratio
        })
    return final_result


class CollegeJobArea(TypedDict):
    college_name: str
    area: str
    rate: float

# 大学毕业生主要就业的城市分布情况（饼图）
# 相关表定义：
### 'college_job_area':
# "college_id"
# "college_name"
# "area_id"
# "area"
# "rate"
# "num"
# "sort"
# "year"
@app.get("/college-job-area")
def get_college_job_area(college_name: str):
    queryResult = db.query("SELECT college_name, area, rate FROM college_job_area WHERE college_name = %s", (college_name,))
    result: List[CollegeJobArea] = []
    for row in queryResult:
        result.append({
            "college_name": row[0],
            "area": row[1],
            "rate": row[2]
        })
    return result


# 不同分数段大学的就业地区
@app.get("/college-job-area-by-score")
def get_college_job_area_by_score():
    # 定义分数段
    score_ranges = [(510, 530), (530, 550), (550, 570), (570, 590), (590, 610), (610, 630), (630, 650), (650, 670), (670, 690)]
    
    result = []
    for low_score, high_score in score_ranges:
        # 查询该分数段内的大学就业地区数据
        query = """
        SELECT cja.area, AVG(cja.rate) as avg_rate
        FROM college_job_area cja
        JOIN college_mark cm ON cja.college_name = cm.college_name
        WHERE cm.low_mark >= %s AND cm.high_mark < %s
        GROUP BY cja.area
        ORDER BY avg_rate DESC
        """
        queryResult = db.query(query, (low_score, high_score))
        
        area_data = []
        other_rate = 0.0
        for i, row in enumerate(queryResult):
            if i < 12:
                area_data.append({
                    "area": row[0],
                    "rate": float(row[1])
                })
            else:
                other_rate += float(row[1])
        
        if other_rate > 0:
            area_data.append({
                "area": "其他",
                "rate": other_rate
            })

        # 重新计算rate
        total_rate = sum(item["rate"] for item in area_data)
        for item in area_data:
            item["rate"] = item["rate"] / total_rate
        result.append({
            "score_range": f"{low_score}-{high_score}",
            "areas": area_data
        })
    return result

# 不同大学类型毕业进入的企业类型
# 相关表定义：
### 'college_info':
# "id"
# "college_name"
# "type_name"
### 'college_job_company':
# "college_id"
# "college_name"
# "job_attr"
# "job_company"
@app.get("/college-job-industry")
def get_college_job_industry():
    # 定义大学类型
    college_types = ["理工类", "综合类", "师范类", "财经类", "政法类", "艺术类", "体育类", "语言类", "农林类"]
    
    result = []
    for college_type in college_types:
        # 查询该大学类型的就业企业类型数据
        query = """
        SELECT cjc.job_attr
        FROM college_job_company cjc
        JOIN college_info ci ON cjc.college_id = ci.id
        WHERE ci.type_name = %s
        """
        queryResult = db.query(query, (college_type,))
        
        job_attr_count = {}
        total_count = 0
        for row in queryResult:
            if not row[0]:
                continue
            job_attrs = eval(row[0])
            for attr in job_attrs:
                if attr not in job_attr_count:
                    job_attr_count[attr] = 0
                job_attr_count[attr] += 1
                total_count += 1
        
        job_attr_data = []
        other_count = 0
        for i, (attr, count) in enumerate(sorted(job_attr_count.items(), key=lambda x: x[1], reverse=True)):
            if i < 10:
                job_attr_data.append({
                    "job_attr": attr,
                    "rate": count / total_count
                })
            else:
                other_count += count
        
        if other_count > 0:
            job_attr_data.append({
                "job_attr": "其他",
                "rate": other_count / total_count
            })
        
        result.append({
            "college_type": college_type,
            "job_attrs": job_attr_data
        })
    
    return result

# 专业就业信息
# 相关表定义：
### 'subject_job_area':
# "subject_id"
# "subject_name"
# "subject_code"
# "area_name"
# "rate"
# "sort"
# ### 'subject_job_industry':
# "subject_id"
# "subject_name"
# "subject_code"
# "industry_name"
# "rate"
# "sort"
# ### 'subject_job_position':
# "subject_id"
# "subject_name"
# "subject_code"
# "industry_name"
# "job_name"
# "position_name"
# "rate"
# "sort"
@app.get("/major-job-info")
def get_major_job_info(major_name: str):
    # 查询专业就业信息（包括地区、行业、职位）
    
    # 查询地区就业信息
    area_query = """
    SELECT area_name, rate
    FROM subject_job_area
    WHERE subject_name = %s
    ORDER BY sort
    """
    area_data = db.query(area_query, (major_name,))
    
    # 查询行业就业信息
    industry_query = """
    SELECT industry_name, rate
    FROM subject_job_industry
    WHERE subject_name = %s
    ORDER BY sort
    """
    industry_data = db.query(industry_query, (major_name,))
    
    # 查询职位就业信息
    position_query = """
    SELECT position_name, rate
    FROM subject_job_position
    WHERE subject_name = %s
    ORDER BY sort
    """
    position_data = db.query(position_query, (major_name,))
    
    # 整理结果
    result = {
        "major_name": major_name,
        "area_info": [{"area_name": row[0], "rate": row[1]} for row in area_data],
        "industry_info": [{"industry_name": row[0], "rate": row[1]} for row in industry_data],
        "position_info": [{"position_name": row[0], "rate": row[1]} for row in position_data]
    }
    
    return result


# 获取全部专业名
@app.get("/all-major-names")
def get_all_major_names():
    queryResult = db.query("SELECT subject_name FROM subject_detail")
    result: List[str] = []
    for row in queryResult:
        result.append(row[0])
    return result

# 获取全部大学名
@app.get("/all-college-names")
def get_all_college_names():
    queryResult = db.query("SELECT sch_name FROM college_info_list")
    result: List[str] = []
    for row in queryResult:
        result.append(row[0])
    return result