
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>
#include "gputimer.h"
#include <cuda.h>
#include <device_functions.h>
#include <cuda_runtime_api.h>

#define numElements 20480
__device__ float3
tile_calculation(float3 accel)
{
	extern volatile __shared__ float4 shPosition[];
	int b = 1;//threadIdx.x;
	accel.x += shPosition[b].x;//problem is here in this function pretty much, where we access shared mem
	return accel;
}
__global__ void
__launch_bounds__(1024, 2)
calculate_forces(void *devX, void *devA)
{
	extern volatile __shared__ float4 shPosition[];
	float4 *globalX = (float4 *)devX;
	float4 *globalA = (float4 *)devA;
	float3 acc = { 0.0f, 0.0f, 0.0f };
	int section;
	int gtid = blockIdx.x * blockDim.x + threadIdx.x;
	for (section = 0; section < 20; section++) {
		int idx = section * blockDim.x + threadIdx.x;
		const_cast<float4&>(shPosition[threadIdx.x]) = globalX[idx];
		__syncthreads();
		acc = tile_calculation(acc);// comment out this line, which has to do with reading the shared memory
		__syncthreads();//and see the performance difference!
	}
	// Save the result in global memory.
	float4 acc4 = { acc.x, acc.y, acc.z, 0.0f };
	globalA[gtid] = acc4;
}
int main()
{
	size_t size = 4 * numElements * sizeof(float);
	printf("[Vector addition of %d elements]\n", numElements);
	// Allocate the host input vectors pos and force.
	float4 *h_pos = (float4 *)malloc(size);
	float4 *h_force = (float4 *)malloc(size);

	// Initialize the host input vectors
	for (int i = 0; i < numElements; ++i)
	{
		h_pos[i].x = 10 * rand() / (float)RAND_MAX;//Generate a random number between 0 and 10
		h_pos[i].y = 10 * rand() / (float)RAND_MAX;
		h_pos[i].z = 10 * rand() / (float)RAND_MAX;
		h_pos[i].w = rand() / (float)RAND_MAX;//Generate a random number between 0 and 1
	}

	cudaError_t err = cudaSuccess;
	float4 *d_pos = NULL;
	err = cudaMalloc((void **)&d_pos, size);
	float4 *d_force = NULL;
	err = cudaMalloc((void **)&d_force, size);

	int threadsPerBlock = 1024;
	int blocksPerGrid = (numElements + threadsPerBlock - 1) / threadsPerBlock;

	printf("%d\n", blocksPerGrid);
	printf("CUDA kernel launch with %d blocks of %d threads\n", blocksPerGrid, threadsPerBlock);
	GpuTimer timer;
	timer.Start();
	calculate_forces<<<blocksPerGrid, threadsPerBlock, 4 * 1024 * sizeof(float) >>> (d_pos, d_force);//
	timer.Stop();
	printf("Time took: %g ms\n", timer.Elapsed());

	printf("Done\n");
    return 0;
}
