import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DataTable } from "./DataTable";
import { createDataTableColumnHelper } from "./table-features";

interface Row {
	name: string;
	demand: number;
}

const columnHelper = createDataTableColumnHelper<Row>();
const columns = columnHelper.columns([
	columnHelper.accessor("name", { header: "Projeto" }),
	columnHelper.accessor("demand", { header: "Demanda" }),
]);
const data: Row[] = [{ name: "Aurora", demand: 75 }];

describe("DataTable sorting", () => {
	it("marks the sorted column and leaves the others unsorted", () => {
		render(
			<DataTable
				columns={columns}
				data={data}
				sortableColumns={["name", "demand"]}
				sort={{ column: "demand", direction: "DESC" }}
				onSortChange={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("columnheader", { name: /demanda/i }),
		).toHaveAttribute("aria-sort", "descending");
		expect(
			screen.getByRole("columnheader", { name: /projeto/i }),
		).toHaveAttribute("aria-sort", "none");
	});

	it("asks for a sort when a header is clicked", () => {
		const onSortChange = vi.fn();
		render(
			<DataTable
				columns={columns}
				data={data}
				sortableColumns={["name"]}
				sort={{ column: "name", direction: "ASC" }}
				onSortChange={onSortChange}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /projeto/i }));

		expect(onSortChange).toHaveBeenCalledWith("name");
		expect(
			screen.queryByRole("button", { name: /demanda/i }),
		).not.toBeInTheDocument();
	});
});
