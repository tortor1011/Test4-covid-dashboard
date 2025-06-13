import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
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
  LineChart,
  Line
} from 'recharts'

// สีสุ่ม 10 สีสำหรับโดนัท
const COLORS = [
  '#ef4444', '#f97316', '#facc15', '#22c55e', '#0ea5e9',
  '#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#94a3b8'
]


type ProvinceData = {
  province: string
  new_case: number
  total_case: number
  new_death: number
}

export default function Home() {
  const { data, isLoading, error } = useQuery<ProvinceData[]>({
    queryKey: ['covid'],
    queryFn: async () => {
      const res = await axios.get('https://covid19.ddc.moph.go.th/api/Cases/today-cases-by-provinces')
      return res.data
    }
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error</p>

  const excludedProvinces = ["ทั้งประเทศ"]

  const filteredData = (data || []).filter(
    (item) => !excludedProvinces.includes(item.province)
  )


  const top10NewCases = [...filteredData]
    .sort((a, b) => b.new_case - a.new_case)
    .slice(0, 10)

  const totalCases = filteredData.reduce((sum, item) => sum + item.total_case, 0) || 0

  const top10TotalCases = [...filteredData]
    .sort((a, b) => b.total_case - a.total_case)
    .slice(0, 10)


  return (

    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* ติดทั้งหมด */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">จำนวนผู้ป่วยทั้งหมด</h2>
          <p className="text-5xl font-bold text-blue-600">{totalCases.toLocaleString()} ราย</p>
        </div>

       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* อันนี้รายจังหวัด */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-green-500 mb-4">ผู้ป่วยรวมรายจังหวัด</h2>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="province" interval={0} angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total_case" stroke="#22c55e" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/*อันนี้ตายทั้งหมด */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-red-500 mb-4">จำนวนผู้เสียชีวิตแยกจังหวัด</h2>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData.filter(d => d.new_death > 0)}
                    dataKey="new_death"
                    nameKey="province"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    innerRadius={70}
                    label
                  >
                    {filteredData.filter(d => d.new_death > 0).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ผู้ป่วยใหม่ท็อปเท็น */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold text-blue-500 mb-4">Top 10 จังหวัดผู้ป่วยใหม่มากที่สุด</h2>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10NewCases} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="province" type="category" />
                <Tooltip />
                <Bar dataKey="new_case" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ติดเยอะไม่ค่อยใส่แมช(มั้ง) */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold text-purple-500 mb-4">Top 10 จังหวัดผู้ป่วยสะสมมากที่สุด</h2>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10TotalCases} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="province" interval={0} angle={-45} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_case" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>

  )
}
