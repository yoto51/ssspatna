import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Loader2, BadgeInfo, Award, BookOpen } from "lucide-react";
import { Student, AcademicRecord } from "@shared/schema";
import { Helmet } from "react-helmet";

export default function StudentAcademic() {
  const { user } = useAuth();

  // Fetch student profile
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: ["/api/student/profile"],
  });

  // Fetch academic records
  const { data: academicRecords, isLoading: isLoadingRecords } = useQuery<AcademicRecord[]>({
    queryKey: ["/api/student/academic-records"],
  });

  const isLoading = isLoadingStudent || isLoadingRecords;

  // Group records by term
  const recordsByTerm: Record<string, AcademicRecord[]> = {};
  if (academicRecords) {
    academicRecords.forEach(record => {
      if (!recordsByTerm[record.term]) {
        recordsByTerm[record.term] = [];
      }
      recordsByTerm[record.term].push(record);
    });
  }

  // Prepare data for the bar chart
  const prepareBarChartData = (records: AcademicRecord[]) => {
    return records.map(record => ({
      subject: record.subject,
      marks: record.marks,
      maxMarks: record.maxMarks,
      percentage: ((record.marks / record.maxMarks) * 100).toFixed(1),
    }));
  };

  // Prepare data for the pie chart - grade distribution
  const prepareGradeDistribution = (records: AcademicRecord[]) => {
    const gradeCounts: Record<string, number> = {};
    
    records.forEach(record => {
      if (!gradeCounts[record.grade]) {
        gradeCounts[record.grade] = 0;
      }
      gradeCounts[record.grade]++;
    });
    
    return Object.keys(gradeCounts).map(grade => ({
      name: grade,
      value: gradeCounts[grade]
    }));
  };

  // Grade colors for pie chart
  const GRADE_COLORS = {
    "A+": "#4CAF50",
    "A": "#8BC34A",
    "B+": "#CDDC39",
    "B": "#FFEB3B",
    "C+": "#FFC107",
    "C": "#FF9800",
    "D": "#FF5722",
    "F": "#F44336",
  };
  
  // Get grade color
  const getGradeColor = (grade: string) => {
    return GRADE_COLORS[grade as keyof typeof GRADE_COLORS] || "#9E9E9E";
  };

  // Get grade badge color
  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "bg-green-100 text-green-800";
      case "A":
        return "bg-green-100 text-green-800";
      case "B+":
        return "bg-lime-100 text-lime-800";
      case "B":
        return "bg-yellow-100 text-yellow-800";
      case "C+":
        return "bg-amber-100 text-amber-800";
      case "C":
        return "bg-orange-100 text-orange-800";
      case "D":
        return "bg-red-100 text-red-800";
      case "F":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate overall performance
  const calculateOverallPerformance = (records: AcademicRecord[]) => {
    if (!records || records.length === 0) return { totalMarks: 0, totalMaxMarks: 0, percentage: 0 };
    
    const totalMarks = records.reduce((sum, record) => sum + record.marks, 0);
    const totalMaxMarks = records.reduce((sum, record) => sum + record.maxMarks, 0);
    const percentage = (totalMarks / totalMaxMarks) * 100;
    
    return { totalMarks, totalMaxMarks, percentage };
  };

  return (
    <>
      <Helmet>
        <title>Academic Records - Trinity International School</title>
        <meta 
          name="description" 
          content="View your academic records, grades, and performance at Trinity International School." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-6">Academic Records</h1>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Student Info Card */}
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle>Student Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Name</h3>
                        <p className="text-base">{user?.fullName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Class</h3>
                        <p className="text-base">
                          Class {student?.class} {student?.section && `- Section ${student.section}`}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Roll Number</h3>
                        <p className="text-base">{student?.rollNumber || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Academic Records Tabs */}
                {Object.keys(recordsByTerm).length > 0 ? (
                  <Tabs defaultValue={Object.keys(recordsByTerm)[0]} className="space-y-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                      {Object.keys(recordsByTerm).map((term) => (
                        <TabsTrigger key={term} value={term}>{term}</TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {Object.entries(recordsByTerm).map(([term, records]) => {
                      const overallPerformance = calculateOverallPerformance(records);
                      const barChartData = prepareBarChartData(records);
                      const gradeDistribution = prepareGradeDistribution(records);
                      
                      return (
                        <TabsContent key={term} value={term} className="space-y-6">
                          {/* Performance Summary */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" />
                                Performance Summary - {term}
                              </CardTitle>
                              <CardDescription>Your overall academic performance</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                                  <h3 className="text-sm font-medium text-primary-800">Total Marks</h3>
                                  <p className="text-xl font-bold mt-1">
                                    {overallPerformance.totalMarks}/{overallPerformance.totalMaxMarks}
                                  </p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                  <h3 className="text-sm font-medium text-green-800">Overall Percentage</h3>
                                  <p className="text-xl font-bold mt-1">
                                    {overallPerformance.percentage.toFixed(2)}%
                                  </p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                  <h3 className="text-sm font-medium text-purple-800">Subjects</h3>
                                  <p className="text-xl font-bold mt-1">{records.length}</p>
                                </div>
                              </div>
                              
                              {/* Performance Charts */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Bar Chart - Subject-wise Performance */}
                                <div className="md:col-span-2">
                                  <h3 className="text-sm font-medium text-gray-500 mb-2">Subject-wise Performance</h3>
                                  <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart
                                        data={barChartData}
                                        margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="subject" angle={-45} textAnchor="end" height={70} />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip 
                                          formatter={(value, name) => {
                                            if (name === "percentage") return [`${value}%`, "Percentage"];
                                            return [value, name];
                                          }}
                                        />
                                        <Bar dataKey="percentage" fill="#3b82f6" name="percentage" />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                                
                                {/* Pie Chart - Grade Distribution */}
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-2">Grade Distribution</h3>
                                  <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                        <Pie
                                          data={gradeDistribution}
                                          cx="50%"
                                          cy="50%"
                                          outerRadius={80}
                                          fill="#8884d8"
                                          dataKey="value"
                                          nameKey="name"
                                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                          {gradeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getGradeColor(entry.name)} />
                                          ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                      </PieChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Detailed Marks */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                Detailed Subject Marks
                              </CardTitle>
                              <CardDescription>Your performance in individual subjects</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Subject</TableHead>
                                      <TableHead>Marks Obtained</TableHead>
                                      <TableHead>Maximum Marks</TableHead>
                                      <TableHead>Percentage</TableHead>
                                      <TableHead>Grade</TableHead>
                                      <TableHead>Remarks</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {records.map((record) => (
                                      <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.subject}</TableCell>
                                        <TableCell>{record.marks}</TableCell>
                                        <TableCell>{record.maxMarks}</TableCell>
                                        <TableCell>
                                          {((record.marks / record.maxMarks) * 100).toFixed(2)}%
                                        </TableCell>
                                        <TableCell>
                                          <Badge className={getGradeBadgeColor(record.grade)}>
                                            {record.grade}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>{record.remarks || "-"}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BadgeInfo className="h-5 w-5 text-blue-500" />
                        No Academic Records
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        No academic records are available for you at the moment. Records will be updated after exams and assessments.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
