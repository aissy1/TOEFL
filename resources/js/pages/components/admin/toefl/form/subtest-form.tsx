import { SubtestMaster, ToeflSubtest } from '@/types';

interface SubtestFormProps {
    masters: SubtestMaster[]; // master subtest
    value: ToeflSubtest[];
    onChange: (value: ToeflSubtest[]) => void;
}

export default function SubtestForm({ masters, value, onChange }: SubtestFormProps) {
    const toggleSubtest = (subtest: SubtestMaster) => {
        const exists = value.find((v) => v.subtest_id === subtest.id);

        if (exists) {
            onChange(value.filter((v) => v.subtest_id !== subtest.id));
        } else {
            onChange([
                ...value,
                {
                    subtest_id: subtest.id,
                    order: value.length + 1,
                    duration_minutes: 30,
                    total_questions: 40,
                    passing_score: 60,
                },
            ]);
        }
    };

    const updateField = (subtest_id: number, field: keyof ToeflSubtest, newValue: number) => {
        onChange(value.map((item) => (item.subtest_id === subtest_id ? { ...item, [field]: newValue } : item)));
    };
    return (
        <div className="space-y-6 rounded border p-4">
            <h3 className="text-lg font-semibold">Subtest Configuration</h3>

            {/* Checkbox List */}
            <div className="grid grid-cols-2 gap-4">
                {masters?.map((subtest) => {
                    const checked = value.some((v) => v.subtest_id === subtest.id);

                    return (
                        <label key={subtest.id} className="flex items-center gap-2">
                            <input type="checkbox" checked={checked} onChange={() => toggleSubtest(subtest)} />
                            {subtest.name}
                        </label>
                    );
                })}
            </div>

            {/* Configuration Table */}
            {value.length > 0 && (
                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-2">Subtest</th>
                                <th className="px-3 py-2">Order</th>
                                <th className="px-3 py-2">Duration (min)</th>
                                <th className="px-3 py-2">Total Questions</th>
                                <th className="px-3 py-2">Passing Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {value.map((item) => {
                                const subtest = masters?.find((s) => s.id === item.subtest_id);

                                return (
                                    <tr key={item.subtest_id} className="border-t">
                                        <td className="px-3 py-2">{subtest?.name}</td>

                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="number"
                                                className="w-20 rounded border px-2 py-1 text-center"
                                                value={item.order}
                                                min={1}
                                                onChange={(e) => updateField(item.subtest_id, 'order', Number(e.target.value))}
                                            />
                                        </td>

                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="number"
                                                className="w-24 rounded border px-2 py-1 text-center"
                                                value={item.duration_minutes}
                                                onChange={(e) => updateField(item.subtest_id, 'duration_minutes', Number(e.target.value))}
                                            />
                                        </td>

                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="number"
                                                className="w-24 rounded border px-2 py-1 text-center"
                                                value={item.total_questions}
                                                onChange={(e) => updateField(item.subtest_id, 'total_questions', Number(e.target.value))}
                                            />
                                        </td>

                                        <td className="px-3 py-2 text-center">
                                            <input
                                                type="number"
                                                className="w-24 rounded border px-2 py-1 text-center"
                                                value={item.passing_score}
                                                onChange={(e) => updateField(item.subtest_id, 'passing_score', Number(e.target.value))}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
